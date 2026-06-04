let n = 3
let v = 0
let animating = false
let totAngle = 0
let ActualKey = '1'
let fc
let magYZ
let magXY
let magXZ
let angYZ
let angXY
let angXZ
let reverse = 1
let released = false
cube = []
let incr = 0.5

function setup(){
    createCanvas(window.innerWidth,window.innerHeight,WEBGL)
    for(let i = 0; i < n; i++){
        for(let j = 0; j < n; j++){
            for(let k = 0; k < n; k++){
                let t = 0
                if((i == 0 || i == n-1) && (j == 0 || j == n-1) && (k == 0 || k == n-1))t=2;
                else if(((i == 0 || i == n-1) && (j == 0 || j == n-1)) || ((i == 0 || i == n-1) && (k == 0 || k == n-1)) || ((k == 0 || k == n-1) && (j == 0 || j == n-1)))t=1;
                else if((i == 0 || i == n-1) || (j == 0 || j == n-1) || (k == 0 || k == n-1))t=0;
                else continue
                cube.push(new Cube(t,i,j,k))
            }
        }
    }
}

class Cube{
    constructor(typ,i,j,k){
        this.typ = typ
        this.i = i
        this.j = j
        this.k = k
        this.len = (min(height,width)*0.5)/n
        this.x = (this.i - n/2 + 0.5)*this.len
        this.y = (this.j - n/2 + 0.5)*this.len
        this.z = (this.k - n/2 + 0.5)*this.len
        this.magYZ = Math.sqrt(this.y**2 + this.z**2)
        this.magXY = Math.sqrt(this.y**2 + this.x**2)
        this.magXZ = Math.sqrt(this.x**2 + this.z**2)
        this.angYZ = Math.atan(this.y/this.z)
        this.angXY = Math.atan(this.x/this.y)
        this.angXZ = Math.atan(this.z/this.x)
        if (this.magXY == 0)this.angXY = 0;
        if (this.magXZ == 0)this.angXZ = 0;
        if (this.magYZ == 0)this.angYZ = 0;
        if(this.z < 0)this.angYZ += PI;
        else if(this.y < 0)this.angYZ += 2*PI
        if(this.y < 0)this.angXY += PI;
        else if(this.x < 0)this.angXY += 2*PI
        if(this.x < 0)this.angXZ += PI;
        else if(this.z < 0)this.angXZ += 2*PI
        this.col = (random()*255,random()*255,random()*255)
        
        
    }
    show(){
        fill(this.col)
        push()
        translate(this.x,this.y,this.z)
        if(animating){
            if(v == 0 && this.i == parseInt(ActualKey))rotateX((frameCount - fc)*-incr*reverse);
            if(v == 1 && this.j == parseInt(ActualKey))rotateY((frameCount - fc)*-incr*reverse);
            if(v == 2 && this.k == parseInt(ActualKey))rotateZ((frameCount - fc)*-incr*reverse);
        }
        box(this.len,this.len,this.len)
        pop()
    }
    update(){
        this.magYZ = Math.sqrt(this.y**2 + this.z**2)
        this.magXY = Math.sqrt(this.y**2 + this.x**2)
        this.magXZ = Math.sqrt(this.x**2 + this.z**2)
        this.angYZ = Math.atan(this.y/this.z)
        this.angXY = Math.atan(this.x/this.y)
        this.angXZ = Math.atan(this.z/this.x)
        if (this.magXY == 0)this.angXY = 0;
        if (this.magXZ == 0)this.angXZ = 0;
        if (this.magYZ == 0)this.angYZ = 0;
        if(this.z < 0)this.angYZ += PI;
        else if(this.y < 0)this.angYZ += 2*PI
        if(this.y < 0)this.angXY += PI;
        else if(this.x < 0)this.angXY += 2*PI
        if(this.x < 0)this.angXZ += PI;
        else if(this.z < 0)this.angXZ += 2*PI
    }
}

function animate(v,num){
    let flag = false
    cube.forEach(e => {
        if( animating && ((v == 0 && e.i == parseInt(num)) || (v == 1 && e.j == parseInt(num)) || (v == 2 && e.k == parseInt(num)))){
            
            // push()
            // translate(e.x,e.y,e.z)
            if(v == 0){e.y = e.magYZ * sin(e.angYZ + reverse * (frameCount - fc)*incr);e.z = e.magYZ * cos(e.angYZ + reverse * (frameCount - fc)*incr);
            }
            else if(v == 1) {e.x = e.magXZ * cos(e.angXZ + reverse * (frameCount - fc)*incr);e.z = e.magXZ * sin(e.angXZ + reverse * (frameCount - fc)*incr);}
            else if(v == 2) {e.x = e.magXY * sin(e.angXY + reverse * (frameCount - fc)*incr);e.y = e.magXY * cos(e.angXY + reverse * (frameCount - fc)*incr);}
            
            // pop()
            if((frameCount - fc)*incr >= HALF_PI){
                flag = true
                if(v == 0){e.y = e.magYZ * sin((e.angYZ + reverse * HALF_PI));e.z = e.magYZ * cos((e.angYZ + reverse * HALF_PI))}
                else if(v == 1) {e.x = e.magXZ * cos((e.angXZ + reverse * HALF_PI));e.z = e.magXZ * sin((e.angXZ + reverse * HALF_PI));}
                else if(v == 2) {e.x = e.magXY * sin((e.angXY + reverse * HALF_PI));e.y = e.magXY * cos((e.angXY + reverse * HALF_PI));}
            }1
        }
    });
    if(flag){fc = 0;animating = false;
        cube.forEach(e => {
            // console.log(e.x,e.y,e.z);
            
            if(((v == 0 && e.i == parseInt(num)) || (v == 1 && e.j == parseInt(num)) || (v == 2 && e.k == parseInt(num)))){
                console.log(e.x,e.y,e.z);
                
                // console.log(e.i,e.j,e.k,'BEFORE');
                e.j = Math.round(Math.abs(e.y/e.len + (n-1)/2))
                e.i = Math.round(Math.abs(e.x/e.len + (n-1)/2))
                e.k = Math.round(Math.abs(e.z/e.len + (n-1)/2))
                // console.log(e.i,e.j,e.k,'AFTER');
                e.update()
            }
        }); 
    }   
}

function draw(){
    background(0)
    if (animating){
        // console.log(ActualKey,totAngle,QUARTER_PI);
        
        animate(v,ActualKey)
    }
    else{
        v = Math.round(random()*2)
        ActualKey = JSON.stringify(Math.round(random()*(n-1)))
        let vlu = random() - 0.5
        reverse = vlu/Math.abs(vlu)
        fc = frameCount
        console.log('yeee',v,ActualKey,reverse);    
        
        animating = true
        // if(released){
        //     released = false
        //     reverse = 1
        // }
    }
    cube.forEach(e => {
        e.show()
    });
    
    orbitControl();
}

// function keyPressed(){
//     if(key == 'r' && animating == false)reverse = -1;
//     if(key == 'w' && animating == false)v = 1;
//     if(key == 'a' && animating == false)v = 0;
//     if(key == 's' && animating == false)v = 2;
//     if('1234567890'.includes(key)){
//         if (animating == false){
//             console.log('mhmm');
//             animating = true
//             ActualKey = key
//             fc = frameCount
//         }
//     }
// }

function keyReleased(){
    noLoop()
}