import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { BackendService } from '../backend.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  errorMessage = ''
  loginform: FormGroup

  constructor(private fb: FormBuilder,
    private backend: BackendService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.loginform = this.fb.group({
      username: this.fb.control('', [Validators.required]),
      password: this.fb.control('', [Validators.required])
    })
  }

  login() {
    // console.log('form processed: ', this.loginform.value)
    const user = this.loginform.value

    this.backend.userLogin(user)
      .subscribe(result => {
        // console.log('result ---> ', result)
        if (result) {
          this.router.navigate(['/main'])
        } else {
          this.errorMessage = "Login failed"
        }
      }

      )
  }

}
