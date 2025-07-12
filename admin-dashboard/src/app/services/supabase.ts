import { Injectable } from '@angular/core';
import { createClient, SupabaseClient} from '@supabase/supabase-js';
import { environment } from '../../environment';
@Injectable({
  providedIn: 'root'
})
export class Supabase {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
  }

  async getSubjects() {
    const {data, error } = await this.supabase
        .from('subjects')
        .select('*')
        .order('name', {ascending: false});

    if(error) throw error;
    return data;    
  }

  async uploadPaper(paper: {
    subject_id: string,
    name: string,
    link: string,
    grade: number
  }) {
    const {data, error } = await this.supabase
        .from('paper')
        .insert([paper]);

    if(error) throw error;
    return data;    
  }
}
