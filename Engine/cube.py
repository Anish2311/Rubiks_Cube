from fastapi import FastAPI, Form
from fastapi.middleware.cors import CORSMiddleware
import json
import math
from numba import njit

depths = 4

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
async def upload_file(n: str = Form(...),bina: str = Form(...),fin: str = Form(...),map: str = Form(...),st: str = Form(...)):
    global resCorner
    global resEdge
    global resFace 
    global moveMap
    global nu
    global orInd
    global solvedStates
    global prevMove
    global reached
    orInd = 0
    nu = int(n)
    binar = bina
    moveMap = json.loads(map)
    moveMap = transform_keys(moveMap)
    print('computation started.')
    sp = binar.split()
    resSp = fin.split()
    corners = int(sp[0],2)
    edges = int(sp[1],2)
    faces = int(sp[2],2)
    resCorner = int(resSp[0],2)
    resEdge = int(resSp[1],2)
    resFace = int(resSp[2],2)
    print(bin(resEdge))
    print(bin(edges))
    if st == 'start':
        solvedStates = {}
        moveRecorder.clear()
        prevMove = 0
        print(orInd,'yeeee')
        print(moveMap)
        compute(resCorner,resEdge,resFace,depths,nu,True,prevMove)
        print(len(solvedStates))
        reached = False
    for j in evalAllOrientation(corners,edges,faces):
        if j[0] == resCorner and j[1] == resEdge and j[2] == resFace:
            return {'move':'solved'}
    v = evaluate(corners,edges,faces)
    print(v)
    moveSet = compute(corners,edges,faces,depths,nu,False,prevMove)
    prevMove = moveSet[0]
    print(moveSet)
    print(len(moveRecorder))
    return {'move':moveSet[0]}

def transform_keys(dct):
    new_dict = {}
    for key, value in dct.items():
        try:
            new_key = int(key)
        except ValueError:
            new_key = key
        new_dict[new_key] = value
    return new_dict


@njit
def bitOerations(b,orig,new,bCopy,ORI_TRANS,transf,bitLen,oriLen):
    bitMask = int(math.pow(2,bitLen) - 2*oriLen)
    if oriLen == 0:
        bitMask -= 1
    bitMask = bitMask << (orig*bitLen)
    bitMask = bitMask & bCopy
    orientBitMask = int(math.pow(2,oriLen) - 1)
    orientBitMask = orientBitMask << (orig*bitLen)
    orientBitMask = bCopy & orientBitMask
    orientBitMask = orientBitMask >> (orig*bitLen)
    if transf:
        orientBitMask = ORI_TRANS[orientBitMask]
    orientBitMask = orientBitMask << (orig*bitLen)
    bitMask = bitMask | orientBitMask
    diff = new - orig
    if diff < 0:
        bitMask = bitMask >> (-1*(diff)*bitLen)
    else:
        bitMask = bitMask << (diff*bitLen)
    negBitMask = int(math.pow(2,bitLen) - 1)
    negBitMask = negBitMask << (new*bitLen)
    negBitMask = ~negBitMask
    mask = (1 << 40) - 1
    negBitMask &= mask
    b = b & negBitMask
    b = b | bitMask
    return b

def makeMove(c,e,f,ind,ori,rev):
    key = ((ind + 1)*10 + (ori+1))*rev
    edgeCopy = e
    faceCopy = f
    cornerCopy = c
    edgeOriMove = False
    if ind > 0 and ind < nu-1:
        edgeOriMove = True
    moves = moveMap[key]['2']
    ORI_TRANS = {
        0: (2,1,0),
        1: (0,2,1),
        2: (1,0,2)
    }
    ORI_TRANS = ORI_TRANS[ori]
    
    for k in moves:
        original = int(k)
        new = moves[k]
        c = bitOerations(c,original,new,cornerCopy,ORI_TRANS,True,5,2)
    
    moves = moveMap[key]['1']
    ORI_TRANS = (1,0)

    for k in moves:
        original = int(k)
        new = moves[k]
        e = bitOerations(e,original,new,edgeCopy,ORI_TRANS,edgeOriMove,math.ceil(math.log2((nu-2)*12)) + 1,1)

    moves = moveMap[key]['0']

    for k in moves:
        original = int(k)
        new = moves[k]
        f = bitOerations(f,original,new,faceCopy,ORI_TRANS,False,math.ceil(math.log2((nu-2)*(nu-2)*6)),0)

    return c,e,f


def compute(corner,edge,face,depth,n,fromSolved,prevMove):
    if depth >= 0:
        moveSet = (0,-1000000)
        if fromSolved:
            if corner == resCorner and edge == resEdge and face == resFace:
                solvedStates[(corner,edge,face)] = (nu*nu*nu + 1)*100
        for i in range(3):
            for j in range(n):
                for k in range(2):
                    if k == 0:
                        rev = 1
                    else:
                        rev = -1
                    res = -800
                    if fromSolved:
                        cr, ed, fc = makeMove(corner,edge,face,j,i,rev)
                        if (cr,ed,fc) not in solvedStates:
                            solvedStates[(cr,ed,fc)] = (nu*nu*nu + 1)*100 - 5*(depths - depth + 1)
                        elif solvedStates[(cr,ed,fc)] < (nu*nu*nu + 1)*100 - 5*(depths - depth + 1):
                            solvedStates[(cr,ed,fc)] = (nu*nu*nu + 1)*100 - 5*(depths - depth + 1)
                        prev = ((j+1)*10 + (i + 1))*rev
                        compute(cr,ed,fc,depth-1,n,True,prev)
                        
                    else:
                        if ((j+1)*10 + (i+1))*rev*-1 != prevMove:
                            cr, ed, fc = makeMove(corner,edge,face,j,i,rev)
                            orAll = evalAllOrientation(cr,ed,fc)
                            for q in orAll:
                                if q in solvedStates:
                                    if solvedStates[q] > res:
                                        res = solvedStates[q]
                                    # print('__________________________________',res)
                            if (cr,ed,fc) in moveRecorder and moveRecorder[(cr,ed,fc)] >= depth:
                                continue
                            if res == -800:
                                for q in orAll:
                                    moveRecorder[q] = depth
                            else:
                                moveRecorder[(cr,ed,fc)] = depth
                            if depth != 0 and res == -800:
                                prev = ((j+1)*10 + (i + 1))*rev
                                res = compute(cr,ed,fc,depth - 1,n,False,prev)[1]
                            elif res == -800:
                                res = evaluate(cr,ed,fc)
                            res = res - 5*(depths - depth + 1)
                            if res > moveSet[1]:
                                moveSet = (((j+1)*10 + i+1)*rev,res)
        else:
            if fromSolved == False:
                return moveSet

                    
def evalAllOrientation(c,e,f):
    all = [(c,e,f)]
    for i in range(3):
        el = (c,e,f)
        for k in range(2):
            if k == 0:
                rev = 1
            else:
                rev = -1
            for j in range(nu):
                el = makeMove(el[0],el[1],el[2],j,i,rev)
            all.append(el)
            el = (c,e,f)
    return all

@njit
def evaluate(corners,edges,faces):
    sim = 0
    bitMask = 0b11111
    j = resCorner
    for i in range(8):
        if(corners & bitMask == j & bitMask):
            sim += 1
        corners >>= 5
        j >>= 5
    if(nu > 2):
        bitLen = math.ceil(math.log2((nu-2)*12)) + 1
        bitMask = int(math.pow(2,bitLen)-1)
        j = resEdge
        for i in range((nu-2)*12):
            if(edges & bitMask == j & bitMask):
                sim += 1
            edges >>= bitLen
            j >>= bitLen
        bitLen = math.ceil(math.log2((nu-2)*(nu-2)*6))
        bitMask = int(math.pow(2,bitLen)-1)
        j = resFace
        for i in range((nu-2)*(nu-2)*6):
            if(faces & bitMask == j & bitMask):
                sim += 1
            faces >>= bitLen
            j >>= bitLen
    # ans = max(ans,sim)
            # print(orInd)
    return sim * 100