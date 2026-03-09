import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://sedjnyryixudxmmkeoam.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNlZGpueXJ5aXh1ZHhtbWtlb2FtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcyODE0NDIsImV4cCI6MjA4Mjg1NzQ0Mn0.5NozVbt66LPMGYLBd2be_IOX3PttYBZETcowwNOkTRA';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function run() {
    const { data, error } = await supabase.functions.invoke('send-notification', {
        body: { userId: "1", title: "t", body: "b" }
    });
    console.log("Error object:", typeof error, error?.constructor?.name);
    console.log("Error properties:", Object.keys(error || {}));
    if (error && error.context) {
        console.log("Is context a Response?", error.context.constructor?.name);
        try {
            const json = await error.context.json();
            console.log("Context JSON:", json);
        } catch(e) { console.log(e); }
    }
}
run();
