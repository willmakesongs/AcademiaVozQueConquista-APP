import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { S3Client, PutObjectCommand } from "https://esm.sh/@aws-sdk/client-s3@3.341.0";
import { getSignedUrl } from "https://esm.sh/@aws-sdk/s3-request-presigner@3.341.0";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        // 1. Get User JWT
        const supabaseClient = createClient(
            Deno.env.get("SUPABASE_URL") ?? "",
            Deno.env.get("SUPABASE_ANON_KEY") ?? "",
            {
                global: {
                    headers: { Authorization: req.headers.get("Authorization")! },
                },
            }
        );

        const {
            data: { user },
            error: userError,
        } = await supabaseClient.auth.getUser();

        if (userError || !user) {
            return new Response(JSON.stringify({ error: "Unauthorized" }), {
                status: 401,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        // 2. Parse Request Body
        const { filename, contentType, folder } = await req.json();

        if (!filename || !contentType || !folder) {
            return new Response(JSON.stringify({ error: "Missing required fields" }), {
                status: 400,
                headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
        }

        // 3. Configure S3 Client for B2
        const s3 = new S3Client({
            endpoint: Deno.env.get("B2_ENDPOINT"), // e.g., https://s3.us-west-004.backblazeb2.com
            region: Deno.env.get("B2_REGION"),
            credentials: {
                accessKeyId: Deno.env.get("B2_APPLICATION_KEY_ID")!,
                secretAccessKey: Deno.env.get("B2_APPLICATION_KEY")!,
            },
        });

        const bucketName = Deno.env.get("B2_BUCKET_NAME")!;
        const key = `${folder}/${user.id}/${filename}`;

        // 4. Generate Presigned URL
        const command = new PutObjectCommand({
            Bucket: bucketName,
            Key: key,
            ContentType: contentType,
        });

        const url = await getSignedUrl(s3, command, { expiresIn: 3600 });

        return new Response(JSON.stringify({ url, path: key }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }
});
