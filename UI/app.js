let n = 5
let v = 0
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
let reverse = 1
let released = false
let cube = {}
let incr = 0.01
let increment = 0
let incrAcc = 0.005
let continuing = true


function setup(){
    createCanvas(window.innerWidth,window.innerHeight,WEBGL)
    for(let k = 0; k < n; k++){
        for(let j = 0; j < n; j++){
            for(let i = 0; i < n; i++){
                let t = 0
                if((i == 0 || i == n-1) && (j == 0 || j == n-1) && (k == 0 || k == n-1))t=2;
                else if(((i == 0 || i == n-1) && (j == 0 || j == n-1)) || ((i == 0 || i == n-1) && (k == 0 || k == n-1)) || ((k == 0 || k == n-1) && (j == 0 || j == n-1)))t=1;
                else if((i == 0 || i == n-1) || (j == 0 || j == n-1) || (k == 0 || k == n-1))t=0;
                else continue
                cube[i + j*n + k*n*n] = new Cube(t,0,i,j,k)
            }
        }
    }
}

class Cube{
    constructor(typ,st,i,j,k){
        this.typ = typ
        this.state = st
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
        this.colours = {}
        this.solveMap = {}
        if (this.magXY == 0)this.angXY = 0;
        if (this.magXZ == 0)this.angXZ = 0;
        if (this.magYZ == 0)this.angYZ = 0;
        if(this.z < 0)this.angYZ += PI;
        else if(this.y < 0)this.angYZ += 2*PI
        if(this.y < 0)this.angXY += PI;
        else if(this.x < 0)this.angXY += 2*PI
        if(this.x < 0)this.angXZ += PI;
        else if(this.z < 0)this.angXZ += 2*PI
        this.col = 50
        if(this.i == 0){this.colours['blue'] = [1,0,0];this.solveMap['blue'] = [1,0,0]}
        if(this.j == 0){this.colours['yellow'] = [0,1,0];this.solveMap['yellow'] = [0,1,0]}
        if(this.k == 0){this.colours['orange'] = [0,0,1];this.solveMap['orange'] = [0,0,1]}
        if(this.i == n-1){this.colours['green'] = [1,0,0];this.solveMap['green'] = [1,0,0]}
        if(this.j == n-1){this.colours['white'] = [0,1,0];this.solveMap['white'] = [0,1,0]}
        if(this.k == n-1){this.colours['red'] = [0,0,1];this.solveMap['white'] = [0,1,0]}
    }
    show(){
        Object.keys(this.colours).forEach(e => {
            let x = 1.001
            let y = 1.001
            let z = 1.001
            if(this.colours[e][0] == 0)x=0.95;
            if(this.colours[e][1] == 0)y=0.95;
            if(this.colours[e][2] == 0)z=0.95;
            // push()
            // translate(this.x + e[0]*this.len*0.5,this.y + e[1]*this.len*0.5,this.z + e[2]*this.len*0.5)
            push()
            fill(e)
            translate(this.x,this.y,this.z)
            if(animating){
                if(v == 0 && this.i == parseInt(ActualKey))rotateX(totAngle*-1*reverse);
                if(v == 1 && this.j == parseInt(ActualKey))rotateY(totAngle*-1*reverse);
                if(v == 2 && this.k == parseInt(ActualKey))rotateZ(totAngle*-1*reverse);
            }
            // pop()
            box(this.len*x,this.len*y,this.len*z)
            pop()
        });
        push()
        fill(this.col)
        noStroke()
        translate(this.x,this.y,this.z)
        if(animating){
            if(v == 0 && this.i == parseInt(ActualKey))rotateX(totAngle*-1*reverse);
            if(v == 1 && this.j == parseInt(ActualKey))rotateY(totAngle*-1*reverse);
            if(v == 2 && this.k == parseInt(ActualKey))rotateZ(totAngle*-1*reverse);
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
        Object.keys(this.colours).forEach(e => {
            if(v == 0 && this.i == parseInt(ActualKey)){
                let sw = this.colours[e][1]
                this.colours[e][1] = this.colours[e][2]
                this.colours[e][2] = sw
            }
            if(v == 1 && this.j == parseInt(ActualKey)){
                let sw = this.colours[e][0]
                this.colours[e][0] = this.colours[e][2]
                this.colours[e][2] = sw
            }
            if(v == 2 && this.k == parseInt(ActualKey)){
                let sw = this.colours[e][1]
                this.colours[e][1] = this.colours[e][0]
                this.colours[e][0] = sw
            }
        });
    }
}

function animate(v,num){
    let flag = false
    Object.keys(cube).forEach(e => {
        if( animating && ((v == 0 && cube[e].i == parseInt(num)) || (v == 1 && cube[e].j == parseInt(num)) || (v == 2 && cube[e].k == parseInt(num)))){
            
            // push()
            // translate(cube[e].x,cube[e].y,cube[e].z)
            if(v == 0){cube[e].y = cube[e].magYZ * sin(cube[e].angYZ + reverse * totAngle);cube[e].z = cube[e].magYZ * cos(cube[e].angYZ + reverse * totAngle);
            }
            else if(v == 1) {cube[e].x = cube[e].magXZ * cos(cube[e].angXZ + reverse * totAngle);cube[e].z = cube[e].magXZ * sin(cube[e].angXZ + reverse * totAngle);}
            else if(v == 2) {cube[e].x = cube[e].magXY * sin(cube[e].angXY + reverse * totAngle);cube[e].y = cube[e].magXY * cos(cube[e].angXY + reverse * totAngle);}
            
            // pop()
            if(totAngle >= (HALF_PI - 0.01)){
                flag = true
                if(v == 0){cube[e].y = cube[e].magYZ * sin((cube[e].angYZ + reverse * HALF_PI));cube[e].z = cube[e].magYZ * cos((cube[e].angYZ + reverse * HALF_PI))}
                else if(v == 1) {cube[e].x = cube[e].magXZ * cos((cube[e].angXZ + reverse * HALF_PI));cube[e].z = cube[e].magXZ * sin((cube[e].angXZ + reverse * HALF_PI));}
                else if(v == 2) {cube[e].x = cube[e].magXY * sin((cube[e].angXY + reverse * HALF_PI));cube[e].y = cube[e].magXY * cos((cube[e].angXY + reverse * HALF_PI));}
            }
            else if (totAngle >= HALF_PI/2){incrAcc = -0.005;}
        }
    });
    increment += incrAcc
    totAngle += increment
    if(flag){fc = 0;animating = false;
        Object.keys(cube).forEach(e => {
            // console.log(e.x,e.y,e.z);
            
            if(((v == 0 && cube[e].i == parseInt(num)) || (v == 1 && cube[e].j == parseInt(num)) || (v == 2 && cube[e].k == parseInt(num)))){
                
                // console.log(cube[e].i,cube[e].j,cube[e].k,'BEFORE');
                cube[e].j = Math.round(Math.abs(cube[e].y/cube[e].len + (n-1)/2))
                cube[e].i = Math.round(Math.abs(cube[e].x/cube[e].len + (n-1)/2))
                cube[e].k = Math.round(Math.abs(cube[e].z/cube[e].len + (n-1)/2))
                // console.log(cube[e].i,cube[e].j,cube[e].k,'AFTER');
                cube[e].update()
            }
        }); 
        incrAcc = 0.005
        totAngle = 0
        increment = 0
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
        if(continuing)animating = true;
        // console.log('yeee',v,ActualKey,reverse);    
        
        // if(released){
        //     released = false
        //     reverse = 1
        // }
    }
    Object.keys(cube).forEach(e => {
        cube[e].show()
    });
    
    orbitControl();
}

function keyPressed(){
    if(key == 'q'){
        if(continuing)continuing = false
        else {continuing = true;binGenerator()}
        
    }
}

function binGenerator(){
    let edgeCounter = 0
    let cornerCounter = 0
    let faceCounter = 0
    let edgeLen = 0
    let faceLen = 0
    let corners = 0n
    let edges = 0n
    let faces = 0n

    if(n > 2){edgeLen = BigInt(Math.floor(Math.log2((n-2)*12)) + 1);faceLen = BigInt(Math.floor(Math.log2(6*(n-2)*(n-2))) + 1)}
    
    for(let i = 0; i < n; i++){
        for(let j = 0; j < n; j++){
            for(let k = 0; k < n; k++){
                if(((i == 0 || i == n-1) && (j == 0 || j == n-1) && (k == 0 || k == n-1)) ||
                (((i == 0 || i == n-1) && (j == 0 || j == n-1)) || ((i == 0 || i == n-1) && (k == 0 || k == n-1)) || ((k == 0 || k == n-1) && (j == 0 || j == n-1))) ||
                ((i == 0 || i == n-1) || (j == 0 || j == n-1) || (k == 0 || k == n-1))){
                    let binrep = 0b0
                    let cb = cube[i + j*n + k*n*n]
                    let cornerShift = 3n
                    let cornerOrientShift = 2n
                    if(cb.typ == 2){
                        let orient = 0n
                        if(Object.keys(cb.colours).includes('yellow')){
                            if(cb.colours['yellow'][0] == 1)orient = 1n
                            if(cb.colours['yellow'][2] == 1)orient = 2n
                        }
                        else if(Object.keys(cb.colours).includes('white')){
                            if(cb.colours['white'][0] == 1)orient = 1n
                            if(cb.colours['white'][2] == 1)orient = 2n
                        }
                        let pos = BigInt(cornerCounter)
                        corners = corners << cornerShift
                        corners |= pos
                        corners = corners << cornerOrientShift
                        corners |= orient
                        cornerCounter += 1
    
                    }
                    else if(cb.typ == 1){
                        let orient = 0n
                        let ky = Object.keys(cb.solveMap)[0]
                        if(cb.solveMap[ky] != cb.colours[ky])orient = 1n;
                        let pos = BigInt(edgeCounter)
                        edges = edges << edgeLen
                        edges |= pos
                        edges = edges << 1n
                        edges |= orient
                        edgeCounter += 1
                        // console.log(edges.toString(2));
                        
                    }
                    else{
                        let pos = BigInt(faceCounter)
                        faces = faces << faceLen
                        faces |= pos
                        faceCounter += 1
                    }
                }
            }
        }
    }
    console.log(corners.toString(2),edges.toString(2),faces.toString(2));
    
}