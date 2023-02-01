const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')

const textureCanvas = document.getElementById('textures')
const tx_ctx = textureCanvas.getContext('2d')

canvas.width = 640 
canvas.height = 360 

let texture = new Image()
let texData = []
texture.onload = () => {
  textureCanvas.height = texture.height
	tx_ctx.drawImage(texture, 0, 0, texture.width, texture.height)
  texData = tx_ctx.getImageData(0, 0, texture.width, texture.height).data
}
texture.src = './spritesheettwo.png'
let texWidth = 128, texHeight = 128

let sky = new Image()
let skyData = []
sky.onload = () => {
	ctx.drawImage(sky, 0, 0, canvas.width, canvas.height/1.4)
  skyData = ctx.getImageData(0, 0, canvas.width, canvas.height/1.4).data
}
sky.src = './SKY2.png'

const map = [
	[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,1],
  [1,0,6,6,6,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,1],
  [1,0,6,0,0,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,3,0,1],
  [1,0,6,0,6,6,0,0,0,0,0,0,0,0,3,3,3,3,3,0,3,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,3,3,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,3,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,0,0,3,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,3,3,3,3,0,1],
  [1,0,0,0,0,7,7,7,7,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,7,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,7,0,3,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,4,0,7,0,3,0,0,4,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,7,7,3,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,3,0,0,0,3,0,0,3,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,6,0,0,0,3,3,3,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,2,0,0,0,0,0,3,3,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,5,0,0,0,5,0,0,3,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,1,0,0,0,4,3,3,1,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,4,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
]

let player = {
	posX: 22,
	posY: 12,
	dirX: -1,
	dirY: 0
}

let offset = 0
let planeX = 0
let planeY = 0.90
let wallX

let aKey = false
let dKey = false
let wKey = false
let sKey = false
let arrowUp = false
let frameTime, oldTime, fps

const main = () => {
	let pixels = ctx.getImageData(0, 0, canvas.width, canvas.height)
  let pixelIndex = (canvas.height >> 1) * (canvas.width << 2)

	const rayDirX0 = player.dirX - planeX;
	const rayDirY0 = player.dirY - planeY;
	const rayDirX1 = player.dirX + planeX;
	const rayDirY1 = player.dirY + planeY;

	for(let y = canvas.height / 2; y < canvas.height; ++y) {
		const p = y - (canvas.height / 2);
		const posZ = 0.5 * canvas.height;
		const rowDistance = posZ / p;

		const floorStepX = rowDistance * (rayDirX1 - rayDirX0) / canvas.width;
		const floorStepY = rowDistance * (rayDirY1 - rayDirY0) / canvas.width;

		let floorX = player.posX + rowDistance * rayDirX0;
		let floorY = player.posY + rowDistance * rayDirY0;

		const cellX = Math.floor(floorX);
		const cellY = Math.floor(floorY);

		for(let x = 0; x < canvas.width; x++) {
			let tx = Math.floor(texWidth * (floorX - cellX)) & 127
			let ty = Math.floor(texHeight * (floorY - cellY)) & 127 

			ty += 384 

			floorX += floorStepX;
			floorY += floorStepY;

			let pixel = ((ty * texture.width + tx) << 2)
			let red = texData[pixel + 0] 
			let green = texData[pixel + 1]
			let blue = texData[pixel + 2]

			pixels.data[pixelIndex + 0] =  red 
			pixels.data[pixelIndex + 1] =  green  
			pixels.data[pixelIndex + 2] =  blue  
      pixels.data[pixelIndex + 3] = 255 / rowDistance * 2
			pixelIndex += 4
		}
	}

	for(let x = 0; x < canvas.width; x++) {
		let cameraX = 2 * x / canvas.width - 1
		let rayDirX = player.dirX + planeX * cameraX
		let rayDirY = player.dirY + planeY * cameraX
		let mapX = Math.floor(player.posX)
		let mapY = Math.floor(player.posY) 
		let sideDistX, sideDistY
		let deltaDistX = (rayDirX == 0) ? 1e30 : Math.abs(1 / rayDirX)
		let deltaDistY = (rayDirY == 0) ? 1e30 : Math.abs(1 / rayDirY)
		let perpWallDist
		let stepX, stepY
		let hit = 0, side
		if(rayDirX < 0) {
			stepX = -1
			sideDistX = (player.posX - mapX) * deltaDistX
		} else {
			stepX = 1
			sideDistX = (mapX + 1.0 - player.posX) * deltaDistX
		}
		if(rayDirY < 0) {
			stepY = -1
			sideDistY = (player.posY - mapY) * deltaDistY
		} else {
			stepY = 1
			sideDistY = (mapY + 1.0 - player.posY) * deltaDistY
		}

		while(hit == 0) {
			if(sideDistX < sideDistY) {
				sideDistX += deltaDistX;
				mapX += stepX;
				side = 0;
			} else {
					sideDistY += deltaDistY;
					mapY += stepY;
					side = 1;
			}
			if (map[Math.floor(mapX)][Math.floor(mapY)] > 0){
				hit = 1
			}
		}

		if(side == 0) {
			perpWallDist = (sideDistX - deltaDistX)
		} else {
			perpWallDist = (sideDistY - deltaDistY)
		}


		let lineHeight = Math.floor(canvas.height / perpWallDist) 
		let drawStart = Math.floor((-lineHeight >> 1) + (canvas.height >> 1))
		if(drawStart < 0) drawStart = 0
		let drawEnd = (lineHeight >> 1) + (canvas.height >> 1)
		if(drawEnd >= canvas.height) drawEnd = canvas.height 

		if(side == 0) {
			wallX = player.posY + perpWallDist * rayDirY
		} else {
			wallX = player.posX + perpWallDist * rayDirX
		}
		wallX -= Math.floor(wallX)

		let texX = Math.floor(wallX * texWidth) 
		if(side == 0 && rayDirX > 0) texX = texture.width - texX - 1;
		if(side == 1 && rayDirY < 0) texX = texture.width - texX - 1;
		let step = 1.0 * texHeight / lineHeight

		let texYOffset = 0

		switch(map[Math.floor(mapX)][Math.floor(mapY)]) {
			case 1:
				texYOffset = 128 
				break
			case 2:
				texYOffset = 0 
				break
			case 3:
				texYOffset = 256 
				break
			case 4:
				texYOffset = 384 
				break
			case 5:
				texYOffset = 512 
				break
			case 6:
				texYOffset = 640 
				break
			case 7:
				texYOffset = 768 
				break
		}

		let texPos = (drawStart - (canvas.height >> 1) + (lineHeight >> 1)) * step;
    pixelIndex = ((drawStart * canvas.width + x) << 2)
		for(let y = drawStart; y < drawEnd; y++) {
			let texY = Math.floor(texPos & 127) + texYOffset
			texPos += step
			let pixel = ((texHeight * texY + texX) << 2)
			let red = texData[pixel + 0]  
			let green = texData[pixel + 1]
			let blue = texData[pixel + 2]

			if(side == 0) {
				red = (red >> 1)
				green = (green >> 1)
				blue = (blue >> 1)
			}

			pixels.data[pixelIndex + 0] = red 
			pixels.data[pixelIndex + 1] = green
			pixels.data[pixelIndex + 2] = blue
      pixels.data[pixelIndex + 3] = 255 / perpWallDist * 2
      pixelIndex += (canvas.width << 2)
		}
    skyOffset = x + offset
    pixelIndex = ((canvas.width + x) << 2)
    if(skyOffset < 0) offset += canvas.width
    if(skyOffset > canvas.width) offset -= canvas.width
    skyOffset = skyOffset % canvas.width

    let pixel = ((canvas.width + skyOffset) << 2)

    for(let y = 0; y < drawStart; y++) {
			let red = skyData[pixel + 0]  
			let green = skyData[pixel + 1]
			let blue = skyData[pixel + 2]
      pixel += (canvas.width << 2)

			pixels.data[pixelIndex + 0] = red 
			pixels.data[pixelIndex + 1] = green
			pixels.data[pixelIndex + 2] = blue
      pixelIndex += (canvas.width << 2)
    }
	}

	ctx.putImageData(pixels, 0, 0)

	let moveSpeed = frameTime * 3.0
	let rotSpeed = frameTime * 3.0

	fps = (1 / frameTime) 
	ctx.font = "10px Arial"
	ctx.fillStyle = "yellow"
	ctx.fillText(fps.toFixed(0), 5, 20);

	if(wKey) {
		if(map[Math.floor(player.posX + player.dirX * moveSpeed)][Math.floor(player.posY)] == 0) player.posX += player.dirX * moveSpeed 	
		if(map[Math.floor(player.posX)][Math.floor(player.posY + player.dirY * moveSpeed)] == 0) player.posY += player.dirY * moveSpeed
	} 
	if(sKey) {
		if(map[Math.floor(player.posX - player.dirX * moveSpeed)][Math.floor(player.posY)] == 0) player.posX -= player.dirX * moveSpeed 
		if(map[Math.floor(player.posX)][Math.floor(player.posY - player.dirY * moveSpeed)] == 0) player.posY -= player.dirY * moveSpeed 
	} 
	if(dKey) {
		let oldDirX = player.dirX
		player.dirX = player.dirX * Math.cos(-rotSpeed) - player.dirY * Math.sin(-rotSpeed)
		player.dirY = oldDirX * Math.sin(-rotSpeed) + player.dirY * Math.cos(-rotSpeed)
		let oldPlaneX = planeX
		planeX = planeX * Math.cos(-rotSpeed) - planeY * Math.sin(-rotSpeed)
		planeY = oldPlaneX * Math.sin(-rotSpeed) + planeY * Math.cos(-rotSpeed)
    offset += Math.cos(rotSpeed) * 15
	}
	if(aKey) {
		let oldDirX = player.dirX
		player.dirX = player.dirX * Math.cos(rotSpeed) - player.dirY * Math.sin(rotSpeed)
		player.dirY = oldDirX * Math.sin(rotSpeed) + player.dirY * Math.cos(rotSpeed)
		let oldPlaneX = planeX
		planeX = planeX * Math.cos(rotSpeed) - planeY * Math.sin(rotSpeed)
		planeY = oldPlaneX * Math.sin(rotSpeed) + planeY * Math.cos(rotSpeed)
    offset -= Math.cos(rotSpeed) * 15
	}
}

document.addEventListener("keydown", (e) => {
	if(e.key === "w") {
			wKey = true
	}
	if(e.key === "s") {
			sKey = true
	}
	if(e.key === "a") {
			aKey = true
	}
	if(e.key === "d") {
			dKey = true
	}
	if(e.key === "ArrowUp") {
			arrowUp = true
	}
})

document.addEventListener("keyup", (e) => {
	if(e.key === "w") {
			wKey = false
	}
	if(e.key === "s") {
			sKey = false
	}
	if(e.key === "a") {
			aKey = false
	}
	if(e.key === "d") {
			dKey = false
	}
	if(e.key === "ArrowUp") {
			arrowUp = false
	}
})

const gameLoop = (time) => {
	  frameTime = (time - oldTime) / 1000;
		oldTime = time;
		fps = Math.round(1 / frameTime);
    ctx.fillStyle = "black"
    ctx.fillRect(0, 0, canvas.width, canvas.height);
		main()
    // let gun = new Image()
    // gun.src = './gun.png'
    // ctx.drawImage(gun, canvas.width / 2 - 50, canvas.height - 100, 100,100)
		window.requestAnimationFrame(gameLoop)
}

window.requestAnimationFrame(gameLoop)
