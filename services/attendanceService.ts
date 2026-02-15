
import { supabase } from '../lib/supabaseClient';
import { AttendanceRecord } from '../types';

export const attendanceService = {
  async markAttendance(record: Omit<AttendanceRecord, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('attendance_records')
      .insert([record])
      .select()
      .single();

    if (error) {
      console.error('Error marking attendance:', error);
      throw error;
    }

    return data;
  },

  async getAttendanceByStudent(studentId: string) {
    const { data, error } = await supabase
      .from('attendance_records')
      .select('*')
      .eq('student_id', studentId)
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching attendance:', error);
      throw error;
    }

    return data as AttendanceRecord[];
  },

  async getAttendanceByClass(courseId: string, date: string) {
    const { data, error } = await supabase
      .from('attendance_records')
      .select('*')
      .eq('course_id', courseId)
      .eq('date', date);

    if (error) {
      console.error('Error fetching class attendance:', error);
      throw error;
    }

    return data as AttendanceRecord[];
  }
};
