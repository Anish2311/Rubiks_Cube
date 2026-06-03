let n = 3
let v = 2
let animating = false
let totAngle = 0
let ActualKey
let fc
let magYZ
let magXY
let magXZ
let angYZ
let angXY
let angXZ
cube = []
let incr = 0.071

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
        this.angYZ = Math.atan(this.z/this.y)
        this.angXY = Math.atan(this.y/this.x)
        this.angXZ = Math.atan(this.x/this.z)
        if (this.magXY == 0)this.angXY = 0;
        if (this.magXZ == 0)this.angXZ = 0;
        if (this.magYZ == 0)this.angYZ = 0;
        if(this.y < 0)this.angYZ += PI;
        if(this.x < 0)this.angXY += PI;
        if(this.z < 0)this.angXZ += PI;
        
        
    }
    show(){
        if (this.typ == 2){
            fill(255,0,0)
        }
        else if (this.typ == 1){
            fill(0,255,0)
        }
        else{
            fill(0,0,255)
        }
        push()
        translate(this.x,this.y,this.z)
        if(animating){
            if(v == 0 && this.i == parseInt(ActualKey))rotateX((fc - frameCount)*-incr);
            if(v == 1 && this.j == parseInt(ActualKey))rotateY((fc - frameCount)*incr);
            if(v == 2 && this.k == parseInt(ActualKey))rotateZ((fc - frameCount)*-incr);
        }
        box(this.len,this.len,this.len)
        pop()
    }
    rotating(v,num){
        
    }
}

function animate(v,num){
    let flag = false
    cube.forEach(e => {
        if( animating && ((v == 0 && e.i == parseInt(num)) || (v == 1 && e.j == parseInt(num)) || (v == 2 && e.k == parseInt(num)))){
            let x = 0
            let y = 0
            let z = 0
            if(v == 0)x=(parseInt(num) - n/2 + 0.5)*e.len
            else if(v == 1) y = (parseInt(num) - n/2 + 0.5)*e.len
            else if(v == 2) z = (parseInt(num) - n/2 + 0.5)*e.len
            // push()
            // translate(e.x,e.y,e.z)
            if(v == 0){e.y = e.magYZ * sin(e.angYZ + (fc - frameCount)*incr);e.z = e.magYZ * cos(e.angYZ + (fc - frameCount)*incr);
            }
            else if(v == 1) {e.x = e.magXZ * sin(e.angXZ + (fc - frameCount)*incr);e.z = e.magXZ * cos(e.angXZ + (fc - frameCount)*incr);}
            else if(v == 2) {e.x = e.magXY * sin(e.angXY + (fc - frameCount)*incr);e.y = e.magXY * cos(e.angXY + (fc - frameCount)*incr);}
            
            // pop()
            if((frameCount - fc)*incr >= HALF_PI){
                flag = true
                if(v == 0){e.y = e.magYZ * sin((e.angYZ + HALF_PI));e.z = e.magYZ * cos((e.angYZ + HALF_PI));console.log(e.magYZ,e.angYZ);
                }
                else if(v == 1) {e.x = e.magXZ * sin((e.angXZ + HALF_PI));e.z = e.magXZ * cos((e.angXZ + HALF_PI));}
                else if(v == 2) {e.x = e.magXY * sin((e.angXY + HALF_PI));e.y = e.magXY * cos((e.angXY + HALF_PI));}
            }
        }
    });
    if(flag){fc = 0;animating = false}
}

function draw(){
    background(0)
    if (animating){
        // console.log(ActualKey,totAngle,QUARTER_PI);
        
        animate(v,ActualKey)
    }
    cube.forEach(e => {
        e.show()
    });
    
    orbitControl();
}

function keyPressed(){
    if('1234567890'.includes(key)){
        if (animating == false){
            console.log('mhmm');
            animating = true
            ActualKey = key
            fc = frameCount
        }
    }
}