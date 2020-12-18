import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { BackendService } from '../backend.service';
import { CameraService } from '../camera.service';
import { SharingService } from '../sharing.service';
import { Upload, User } from './../models';

@Component({
	selector: 'app-main',
	templateUrl: './main.component.html',
	styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {

	imagePath = '/assets/cactus.png'
	form: FormGroup
	hasImage: boolean = false
	loginUser: User

	constructor(private cameraSvc: CameraService,
		private fb: FormBuilder,
		private backend: BackendService,
		private router: Router,
		private shareData: SharingService,

	) { }

	ngOnInit(): void {
		if (this.cameraSvc.hasImage()) {
			const img = this.cameraSvc.getImage()
			this.imagePath = img.imageAsDataUrl
			this.hasImage = true
		}
		this.form = this.fb.group({
			title: this.fb.control('', [Validators.required]),
			comments: this.fb.control('', [Validators.required])
		})
		this.loginUser = this.shareData.getData()
		console.log('login user', this.loginUser)
	}

	clear() {
		this.imagePath = '/assets/cactus.png'
		this.form.reset()
	}

	sendData() {

		const img = this.cameraSvc.getImage()

		this.backend.userLogin(this.loginUser).subscribe(
			result => {
				// console.log('result ---> ', result)
				if (result) {
					// if login then proceed
					console.log('User checked. ')
					const data = {
						...img,
						...this.loginUser,
						...this.form.value
					}	
					this.backend.upload(data)
						.then(res => {
							console.log('>>>Upload result: ', res)
							this.clear()
						})
						.catch(e => {
							console.error('>>Upload error',e)
							if (e['status'] == 401)
								this.router.navigate(['/']);
						});	

				} else {
					this.router.navigate(['/main'])
				}
			  }
		)

		// const formData = new FormData()
		// // formData.set('user', this.loginUser)
		// formData.set('title', this.form.get('title').value)
		// formData.set('comments', this.form.get('comments').value)
		// formData.set('image', this.imagePath)


	}
}

