export interface CameraImage {
	imageAsDataUrl: string
	imageData: Blob
}

export interface User {
	user_id: string
	password: string
}

export interface Upload {
	// user: string
	title: string
	comments: string
	image: Blob
}