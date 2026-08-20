import { Hono } from "hono";
import { cors } from "hono/cors";
type Bindings = { DB: D1Database };
const app = new Hono<{ Bindings: Bindings }>();
app.use("/api/*", cors());
function gid(){return crypto.randomUUID()}
function sh(s:string){let h=0;for(let i=0;i<s.length;i++){h=((h<<5)-h)+s.charCodeAt(i);h=h&h}return Math.abs(h).toString(16)}
app.post("/api/auth/signup",async(c)=>{
const{email,password,full_name,phone}=await c.req.json();
if(!email||!password||!full_name)return c.json({error:"All fields required"},400);
