from fastapi import FastAPI, Form
from fastapi.middleware.cors import CORSMiddleware
import json
import math
from numba import njit

depths = 3
fromSolvedDepths = 5

moveRecorder = {}
solvedStates = {}
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
    global prevMove
    global reached
    global endResult
    global faceTurns
    global indTurns
    global edgeIncr
    global edgeOriIncr
    global cornerIncr
    cornerIncr = 0
    edgeIncr = 0
    edgeOriIncr = 0
    indTurns = []
    faceTurns = [0,1,2]
    orInd = 0
    nu = int(n)
    for i in range(nu):
        indTurns.append(i)
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
    endResult = encrypt(resCorner,resEdge,resFace)
    if st == 'start':
        moveRecorder.clear()
        prevMove = 0
        print(orInd,'yeeee')
        print(moveMap)
        if len(solvedStates) == 0:
            compute(resCorner,resEdge,resFace,fromSolvedDepths,nu,True,prevMove)
        print(len(solvedStates))
        reached = False
    if edges == resEdge and corners == resCorner and faces == resFace:
        return {'move':'solved'}
    if nu > 2 and edges == resEdge:
        faceTurns = [0,1]
    if nu > 2 and faces == resFace:
        indTurns = [0,nu-1]
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
def bitOerations(b,orig,new,bCopy,ORI_TRANS,transf,bitLen,oriLen,totCube):
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
    mask = (1 << bitLen*totCube) - 1
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
    if (ind > 0 and ind < nu-1) or ori == 1:
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
        c = bitOerations(c,original,new,cornerCopy,ORI_TRANS,True,5,2,8)
    
    moves = moveMap[key]['1']
    ORI_TRANS = (1,0)

    for k in moves:
        original = int(k)
        new = moves[k]
        e = bitOerations(e,original,new,edgeCopy,ORI_TRANS,edgeOriMove,math.ceil(math.log2((nu-2)*12)) + 1,1,(nu-2)*12)

    moves = moveMap[key]['0']

    for k in moves:
        original = int(k)
        new = moves[k]
        f = bitOerations(f,original,new,faceCopy,ORI_TRANS,False,math.ceil(math.log2((nu-2)*(nu-2)*6)),0,(nu-2)*(nu-2)*6)

    return c,e,f


def compute(corner,edge,face,depth,n,fromSolved,prevMove):
    if depth >= 0:
        moveSet = (0,-1000000)
        if fromSolved:
            if corner == resCorner and edge == resEdge and face == resFace:
                solvedStates[encrypt(corner,edge,face)] = (nu*nu*nu*nu + 1)*100000
        for i in faceTurns:
            for j in indTurns:
                for k in range(2):
                    if k == 0:
                        rev = 1
                    else:
                        rev = -1
                    res = -800
                    if fromSolved:
                        if ((j+1)*10 + (i+1))*rev*-1 != prevMove and (j == 0 or j == nu - 1) and (nu == 2 or i != 1):
                            cr, ed, fc = makeMove(corner,edge,face,j,i,rev)
                            en = encrypt(cr,ed,fc)
                            if en not in solvedStates:
                                solvedStates[en] = (nu*nu*nu*nu + 1)*100000 - 5*(fromSolvedDepths - depth + 1)
                            elif solvedStates[en] < (nu*nu*nu*nu + 1)*100000 - 5*(fromSolvedDepths - depth + 1):
                                solvedStates[en] = (nu*nu*nu*nu + 1)*100000 - 5*(fromSolvedDepths - depth + 1)
                            prev = ((j+1)*10 + (i + 1))*rev
                            compute(cr,ed,fc,depth-1,n,True,prev)
                        
                    else:
                        if ((j+1)*10 + (i+1))*rev*-1 != prevMove:
                            cr, ed, fc = makeMove(corner,edge,face,j,i,rev)
                            enc = encrypt(cr,ed,fc)
                            if enc in solvedStates:
                                if solvedStates[enc] > res:
                                    res = solvedStates[enc]
                                # print('__________________________________',res)
                            if enc in moveRecorder and moveRecorder[enc] >= depth:
                                continue
                            moveRecorder[enc] = depth
                            if depth != 0 and res == -800:
                                prev = ((j+1)*10 + (i + 1))*rev
                                res = compute(cr,ed,fc,depth - 1,n,False,prev)[1]
                            elif res == -800:
                                res = evaluate(cr,ed,fc)
                            res = res - 5*(depths - depth)
                            if res > moveSet[1]:
                                moveSet = (((j+1)*10 + i+1)*rev,res)
        else:
            if fromSolved == False:
                return moveSet

                    
# def evalAllOrientation(c,e,f):
#     all = [encrypt(c,e,f)]
#     for i in range(3):
#         el = (c,e,f)
#         for k in range(3):
#             if k == 0:
#                 rev = 1
#             elif k == 1:
#                 rev = -1
#             else:
#                 rev = 2
#             for j in range(nu):
#                 if rev == 2:
#                     el = makeMove(el[0],el[1],el[2],j,i,1)
#                     el = makeMove(el[0],el[1],el[2],j,i,1)
#                 else:
#                     el = makeMove(el[0],el[1],el[2],j,i,rev)
#             all.append(encrypt(el[0],el[1],el[2]))
#             el = (c,e,f)
#     return all

def encrypt(c,e,f):
    bitRep = c
    if e > 0:
        bitLen = 40
        e <<= bitLen
        bitRep |= e
    if f > 0:
        bitLen = (math.ceil(math.log2((nu-2)*12)) + 1)*(nu-2)*12 + 40
        f <<= bitLen
        bitRep |= f
    return bitRep 

def evaluate(corners,edges,faces):
    global faceTurns
    global indTurns
    global edgeIncr
    global edgeOriIncr
    global cornerIncr
    global depths
    sim = 0
    if(nu > 2):
        j = resFace
        bitLen = math.ceil(math.log2((nu-2)*(nu-2)*6))
        bitMask = int(math.pow(2,bitLen)-1)
        faceCounter = 0
        for i in range((nu-2)*(nu-2)*6):
            if(faces & bitMask == j & bitMask):
                sim += 100
                faceCounter += 1
            faces >>= bitLen
            j >>= bitLen
        if faceCounter == 6:
            edgeOriIncr = 10
            indTurns = [0,nu-1]
        else:
            indTurns = list(range(nu))
            edgeIncr = 0
            cornerIncr = 0
            depths = 3
        j = resEdge
        bitLen = math.ceil(math.log2((nu-2)*12)) + 1
        bitMask = int(math.pow(2,bitLen)-1)
        oriBM = 0b1
        edgeCount = 0
        edgeTotCount = 0
        for i in range((nu-2)*12):
            if(edges & bitMask == j & bitMask):
                sim += edgeIncr
                edgeTotCount += 1
            if(edges & oriBM == j & oriBM):
                sim += edgeOriIncr
                edgeCount += 1
            edges >>= bitLen
            j >>= bitLen
        if edgeCount == 12:
            faceTurns = [0,2]
            indTurns = [0,nu-1]
            
            depths = 4
            edgeIncr = 10
            if edgeTotCount == 12:
                cornerIncr = 100
            else:
                cornerIncr = 0
        else:
            depths = 3
            faceTurns = [0,1,2]
            cornerIncr = 0
    else:
        cornerIncr = 1
    bitMask = 0b11111
    j = resCorner
    for i in range(8):
        if(corners & bitMask == j & bitMask):
            sim += cornerIncr
        corners >>= 5
        j >>= 5
    # ans = max(ans,sim)
            # print(orInd)
    return sim * 100