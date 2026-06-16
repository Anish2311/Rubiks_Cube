from fastapi import FastAPI, Form
from fastapi.middleware.cors import CORSMiddleware
import json

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/upload")
async def upload_file(n: str = Form(...),bin: str = Form(...),fin: str = Form(...),map: str = Form(...)):
    n = int(n)
    binar = bin
    map = json.loads(map)
    print('computation started.')
    print(binar,n,fin,map)
    sp = binar.split()
    resSp = fin.split()
    corners = sp[0]
    edges = sp[1]
    faces = sp[2]
    resCorner = resSp[0]
    resEdge = resSp[1]
    resFace = resSp[2]
    orientation = 3
    index = 0

# def makeMove(ind,ori):


# def compute(depth,beta):
#     if(depth != 0):


# def evaluate(corners,edges,faces,resCorner,resEdge,resFace):
#     sim = 0
#     bitMask = 0b11111
#     for i in range(8):
#         if(corners & bitMask == resCorner & bitMask):
#             sim += 1
#         bitMask = bitMask << 5
#     return sim * 100