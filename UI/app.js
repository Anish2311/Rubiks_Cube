let n = 3
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
let cube = []
let incr = 0.01
let increment = 0
let absIncrAcc = 0.1
let incrAcc = absIncrAcc
let continuing = true
let shuffleCounter = 0
let finished = ''
let vInd = 0 
let keyInd = 0
let revInd = 1
let moveMap = {}
let firFlag = false
let over = true
let shuffling = false
let calibrating = true
let nextMove = false
let start = 'start'

async function handleUpload(rep){;
    
    const formData = new FormData();
    formData.append("n", JSON.stringify(n));
    formData.append("bina", rep);
    formData.append("fin", finished);
    formData.append("map", JSON.stringify(moveMap));
    formData.append("st", start);

    try {
    const res = await fetch("http://localhost:8000/upload", {
        method: "POST",
        // mode: "cors",
        body: formData,
    });

    if (!res.ok) {
        throw new Error("Upload failed");
    }

    let moveSet = await res.json();
    moveSet = moveSet['move']
    if(moveSet == 'solved'){
        console.log('solved');
        
    }
    else{
        ActualKey = `${Math.floor(Math.abs(moveSet/10)) - 1}`
        v = Math.abs(moveSet)%10 - 1
        reverse = moveSet/Math.abs(moveSet)
        fc = frameCount
        if(start == 'start'){
            start = 'stop'
        }
        if(continuing){animating = true;nextMove = true}
    }
    
    } catch (err) {
    console.error(err);
    alert("Upload failed: " + err.message);
    }
};

function setup(){
    createCanvas(window.innerWidth,window.innerHeight,WEBGL)
    let edgeCounter = 0
    let cornerCounter = 0
    let faceCounter = 0
    for(let i = 0; i < n; i++){
        for(let j = 0; j < n; j++){
            for(let k = 0; k < n; k++){
                let t = 0
                let ind = -1
                if((i == 0 || i == n-1) && (j == 0 || j == n-1) && (k == 0 || k == n-1)){t=2;ind=cornerCounter;cornerCounter+=1;}
                else if(((i == 0 || i == n-1) && (j == 0 || j == n-1)) || ((i == 0 || i == n-1) && (k == 0 || k == n-1)) || ((k == 0 || k == n-1) && (j == 0 || j == n-1))){t=1;ind=edgeCounter;edgeCounter+=1}
                else if((i == 0 || i == n-1) || (j == 0 || j == n-1) || (k == 0 || k == n-1)){t=0;ind=faceCounter;faceCounter+=1}
                else continue
                cube.push(new Cube(t,ind,i,j,k))
            }
        }
    }
    console.log(cube);
    finished = binGenerator()
    
}

class Cube{
    constructor(typ,st,i,j,k){
        this.typ = typ
        this.i = i
        this.j = j
        this.k = k
        this.actualIndex = st
        this.actualIndex = BigInt(this.actualIndex)
        this.ori = 0
        this.index = st
        this.index = BigInt(this.index)
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

        // console.log(this.x,this.y,this.z);
        
        this.magYZ = Math.sqrt(this.y**2 + this.z**2)
        this.magXY = Math.sqrt(this.y**2 + this.x**2)
        this.magXZ = Math.sqrt(this.x**2 + this.z**2)
        this.angYZ = Math.atan(this.y/this.z)
        this.angXY = Math.atan(this.x/this.y)
        this.angXZ = Math.atan(this.z/this.x)
        let changing = this.index
        this.index = 0
        if(this.typ == 2){
            this.index = (this.k/(n-1)) + (this.j/(n-1))*2 + (this.i/(n-1))*4
        }
        else if(this.typ == 1){
            if(this.i == 0 || this.i == n-1){
                if(this.i == n-1)this.index = (n-2)*8
                if(this.j == 0){
                    this.index += this.k - 1
                }
                else if(this.j == n-1){
                    this.index += this.k - 1 + (n-2)*3
                }
                else{
                    this.index += n-2 + (this.j-1)*2 + this.k/(n-1)
                }
            }
            else{
                this.index = (n-2)*4 + (this.i-1)*4 + (this.j/(n-1))*2 + this.k/(n-1)
            }
        }
        else{
            if(this.i == 0){
                this.index = (this.j-1)*(n-2) + (this.k-1)
            }
            else if(this.i == n-1){
                this.index = (this.j-1)*(n-2) + (this.k-1)
                this.index += (n-2)*(n-2) + 4*(n-2)
            }
            else{
                this.index = (n-2)*(n-2) + (this.i-1)*4
                if(this.j == 0 || this.j == n-1)this.index += this.k - 1
                else this.index += this.k/(n-1)
                if(this.j > 0)this.index += n-2 + (this.j - 1)*2
            }
        }
        this.index = BigInt(this.index)
        
        if (this.magXY == 0)this.angXY = 0;
        if (this.magXZ == 0)this.angXZ = 0;
        if (this.magYZ == 0)this.angYZ = 0;
        if(this.z < 0){this.angYZ += PI;}
        else if(this.y < 0){this.angYZ += 2*PI;}
        if(this.y < 0){this.angXY += PI;}
        else if(this.x < 0){this.angXY += 2*PI;}
        if(this.x < 0){this.angXZ += PI;}
        else if(this.z < 0){this.angXZ += 2*PI;}
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
    cube.forEach(e => {
        if( animating && ((v == 0 && e.i == parseInt(num)) || (v == 1 && e.j == parseInt(num)) || (v == 2 && e.k == parseInt(num)))){
            
            // push()
            // translate(e.x,e.y,e.z)
            if(v == 0){e.y = e.magYZ * sin(e.angYZ + reverse * totAngle);e.z = e.magYZ * cos(e.angYZ + reverse * totAngle);
            }
            else if(v == 1) {e.x = e.magXZ * cos(e.angXZ + reverse * totAngle);e.z = e.magXZ * sin(e.angXZ + reverse * totAngle);}
            else if(v == 2) {e.x = e.magXY * sin(e.angXY + reverse * totAngle);e.y = e.magXY * cos(e.angXY + reverse * totAngle);}
            
            // pop()
            if(totAngle >= (HALF_PI - 0.01)){
                flag = true
                if(v == 0){e.y = e.magYZ * sin((e.angYZ + reverse * HALF_PI));e.z = e.magYZ * cos((e.angYZ + reverse * HALF_PI))}
                else if(v == 1) {e.x = e.magXZ * cos((e.angXZ + reverse * HALF_PI));e.z = e.magXZ * sin((e.angXZ + reverse * HALF_PI));}
                else if(v == 2) {e.x = e.magXY * sin((e.angXY + reverse * HALF_PI));e.y = e.magXY * cos((e.angXY + reverse * HALF_PI));}
            }
            else if (totAngle >= HALF_PI/2){incrAcc = -absIncrAcc;}
        }
    });
    increment += incrAcc
    totAngle += increment
    if(flag){fc = 0;animating = false;
        cube.forEach(e => {
            // console.log(e.x,e.y,e.z);
            
            if(((v == 0 && e.i == parseInt(num)) || (v == 1 && e.j == parseInt(num)) || (v == 2 && e.k == parseInt(num)))){
                
                // console.log(e.i,e.j,e.k,'BEFORE');
                e.j = Math.round(Math.abs(e.y/e.len + (n-1)/2))
                e.i = Math.round(Math.abs(e.x/e.len + (n-1)/2))
                e.k = Math.round(Math.abs(e.z/e.len + (n-1)/2))

                if (e.typ == 1 && parseInt(num) > 0 && parseInt(num) < n-1){
                    if(e.ori == 0)e.ori = 1
                    else if(e.ori == 1)e.ori = 0
                }
                // console.log(e.i,e.j,e.k,'AFTER');
                e.update()
            }
        }); 
        incrAcc = absIncrAcc
        totAngle = 0
        increment = 0
    }   
}

function draw(){
    background(0)
    let checker = []
    cube.forEach(e => {
        e.show()
        let ind = e.i + e.j*n + e.k*n*n
        if(checker.includes(ind)){
            continuing = false
            location.reload()
            
        }
        else{
            checker.push(ind)
        }
    });
    if (animating){
        // console.log(ActualKey,totAngle,QUARTER_PI);
        
        animate(v,ActualKey)
    }
    else{
        if(shuffling){
            if(shuffleCounter > 0){
                v = Math.round(random()*2)
                ActualKey = JSON.stringify(Math.round(random()*(n-1)))
                let vlu = random() - 0.5
                reverse = vlu/Math.abs(vlu)
                fc = frameCount
                if(continuing)animating = true;
                shuffleCounter -= 1

                // console.log('yeee',v,ActualKey,reverse);    
                
                // if(released){
                //     released = false
                //     reverse = 1
                // }
            }
            else{
                absIncrAcc = 0.05
                shuffling = false
                console.log('shuffling over');
                
            }
        }
        else if(calibrating){
            let undoing = 1
            if(over){
                if(firFlag){
                    if(revInd == 1)revInd = -1;
                    else if(keyInd < n-1){revInd = 1;keyInd += 1;}
                    else if(vInd < 2){revInd = 1; keyInd = 0; vInd += 1}
                    else {shuffling = true;console.log(moveMap);calibrating = false}
                }
                else{
                    firFlag = true
                }
                over = false
            }
            else{
                mapGenerator(((vInd+1) + (keyInd+1)*10)*revInd)
                undoing = -1
                over = true
            }
            v = vInd
            ActualKey = JSON.stringify(keyInd)
            reverse = revInd * undoing
            fc = frameCount
            if(continuing)animating = true;
        }
        else{
            if(nextMove){
                let b = binGenerator()
                handleUpload(b)
                nextMove = false
                // noLoop()
            }
            
        }
    }
    
    orbitControl();
}

function keyPressed(){
    if(key == 'q'){
        if(continuing)continuing = false
        else {continuing = true}
    }
    if(key == 'b' && continuing == false)binGenerator()
    if(key == 'g')nextMove = true
}

function mapGenerator(k){
    let mapper = {2:{},1:{},0:{}}
    cube.forEach(e => {
        if(Number(e.actualIndex) != Number(e.index))
        mapper[e.typ][Number(e.actualIndex)] = Number(e.index)
    });
    moveMap[k] = mapper
}

function binGenerator(){
    let edgeLen = 0n
    let faceLen = 0n
    let corners = 0n
    let edges = 0n
    let faces = 0n

    if(n > 2){edgeLen = BigInt(Math.floor(Math.log2((n-2)*12)) + 1);faceLen = BigInt(Math.floor(Math.log2(6*(n-2)*(n-2))) + 1)}
    
    cube.forEach(e => {
        let cb = e
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
            let pos = cb.actualIndex
            pos = pos << 2n
            pos |= orient
            pos = pos << 5n*cb.index
            corners |= pos
            
        }
        else if(cb.typ == 1){
            let orient = 0n
            let ky = Object.keys(cb.solveMap)[0]
            orient = BigInt(cb.ori)
            let pos = cb.actualIndex
            pos = pos << 1n
            pos |= orient
            pos = pos << (edgeLen+1n)*cb.index
            edges |= pos
            
        }
        else{
            let pos = cb.actualIndex
            pos = pos << faceLen*cb.index
            faces |= pos
        }
    });
    return (corners.toString(2)+' '+edges.toString(2)+' '+faces.toString(2))
}