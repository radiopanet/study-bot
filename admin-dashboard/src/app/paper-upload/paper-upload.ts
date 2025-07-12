import { Component, OnInit } from '@angular/core';
import { Supabase } from '../services/supabase';

@Component({
  selector: 'app-paper-upload',
  standalone: false,
  templateUrl: './paper-upload.html',
  styleUrl: './paper-upload.css'
})
export class PaperUpload implements OnInit {
  subjects: any[] = [];
  status = '';

  form = {
    subject_id: '',
    name: '',
    link: '',
    grade: 12
  };


  constructor(private supabaseSer: Supabase) { }

  async ngOnInit() {
    try {
      this.subjects = await this.supabaseSer.getSubjects();
    } catch (err) {
      console.error('Error fetching subjects: ', err);
      this.status = 'Could not load subjects';
    }
  }

  async submit() {
    try {
      await this.supabaseSer.uploadPaper(this.form);
      this.status = 'Paper uploaded successfully!';
      this.form = { subject_id: '', name: '', link: '', grade: 12 };
    } catch (err) {
      console.error('Upload failed:', err);
      this.status = 'Failed to upload paper.';
    }
  }
}
