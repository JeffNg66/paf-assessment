import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { BackendService } from '../backend.service';
import { CameraService } from '../camera.service';

@Component({
	selector: 'app-main',
	templateUrl: './main.component.html',
	styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {

	imagePath = '/assets/cactus.png'
	form: FormGroup
	hasImage: boolean = false

	constructor(private cameraSvc: CameraService,
		private fb: FormBuilder,
		private backend: BackendService,
		private router: Router,
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
	}

	clear() {
		this.imagePath = '/assets/cactus.png'
	}
}
