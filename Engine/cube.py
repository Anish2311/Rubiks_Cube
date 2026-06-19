from fastapi import FastAPI, Form
from fastapi.middleware.cors import CORSMiddleware
import json

depths = 6

moveRecorder = {}
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/upload")
async def upload_file(n: str = Form(...),bin: str = Form(...),fin: str = Form(...),map: str = Form(...),st: str = Form(...)):
    global resCorner
    global resEdge
    global resFace 
    global moveMap
    global nu
    if st == 'start':
        moveRecorder.clear()
    nu = int(n)
    binar = bin
    moveMap = json.loads(map)
    print('computation started.')
    sp = binar.split()
    resSp = fin.split()
    corners = int(sp[0],2)
    edges = int(sp[1],2)
    faces = int(sp[2],2)
    resCorner = int(resSp[0],2)
    resEdge = int(resSp[1],2)
    resFace = int(resSp[2],2)
    v = evaluate(corners,edges,faces)
    print(v)
    moveSet = compute(corners,edges,faces,depths,nu)
    print(moveSet)
    print(len(moveRecorder))
    return {'move':moveSet[0]}

def makeMove(c,e,f,ind,ori,rev):
    key = str(((ind + 1)*10 + (ori+1))*rev)
    cornerCopy = c
    edgeCopy = e
    faceCopy = f
    for k in moveMap[key]['2']:
        original = int(k)
        new = moveMap[key]['2'][k]
        bitMask = 0b11100
        bitMask = bitMask << (original*5)
        bitMask = bitMask & cornerCopy
        orientBitMask = 0b11
        orientBitMask = orientBitMask << (original*5)
        orientBitMask = cornerCopy & orientBitMask
        orientBitMask = orientBitMask >> (original*5)
        if(orientBitMask == 0):
            if(ori == 0):
                orientBitMask = 2
            elif(ori == 2):
                orientBitMask = 1
        elif(orientBitMask == 1):
            if(ori == 2):
                orientBitMask = 0
            elif(ori == 1):
                orientBitMask = 2
        elif(orientBitMask == 2):
            if(ori == 0):
                orientBitMask = 0
            elif(ori == 1):
                orientBitMask = 1
        orientBitMask = orientBitMask << (original*5)
        bitMask = bitMask | orientBitMask
        diff = new - original
        if diff < 0:
            bitMask = bitMask >> (-1*(diff)*5)
        else:
            bitMask = bitMask << (diff*5)
        negBitMask = 0b11111
        negBitMask = negBitMask << (new*5)
        negBitMask = ~negBitMask
        mask = (1 << 40) - 1
        negBitMask = int(format(negBitMask & mask, f'0{40}b'),2)
        c = c & negBitMask
        c = c | bitMask
    return c,e,f


def compute(corner,edge,face,depth,n):
    moveSet = (0,0)
    for i in range(3):
        for j in range(n):
            for k in range(2):
                if k == 0:
                    rev = 1
                else:
                    rev = -1
                cr, ed, fc = makeMove(corner,edge,face,j,i,rev)
                if cr in moveRecorder and moveRecorder[cr] >= depth:
                    continue
                for q in evalAllOrientation(cr):
                    moveRecorder[q] = depth
                res = evaluate(cr,ed,fc)
                if depth != 0:
                    if(res != 800):
                        res = compute(cr,ed,fc,depth - 1,n)[1]
                res = res - (depths-depth) * 5
                # print(res,depth)
                if res > moveSet[1]:
                    moveSet = (((j+1)*10 + i+1)*rev,res)
    else:
        return moveSet

                    
def evalAllOrientation(st):
    all = [st]
    for i in range(3):
        c = st
        for k in range(2):
            if k == 0:
                rev = 1
            else:
                rev = -1
            for j in range(nu):
                c,e,f = makeMove(c,resEdge,resFace,j,i,rev)
            all.append(c)
            c = st
    return all


def evaluate(corners,edges,faces):
    orien = evalAllOrientation(resCorner)
    ans = 0
    for j in orien:
        sim = 0
        bitMask = 0b11111
        for i in range(8):
            if(corners & bitMask == j & bitMask):
                sim += 1
            bitMask = bitMask << 5
        ans = max(sim,ans)
    return ans * 100