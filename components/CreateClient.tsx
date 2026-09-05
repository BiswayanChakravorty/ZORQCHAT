"use client";
import {useEffect,useState} from "react";
import {useSearchParams} from "next/navigation";
import Header from "@/components/Header";
import PublishButton from "@/components/PublishButton";
import {catalog} from "@/lib/catalog";
import {supabaseBrowser} from "@/lib/supabase";

export default function CreateClient(){
  const params=useSearchParams();
  const [prompt,setPrompt]=useState("");
  const [file,setFile]=useState<File|null>(null);
  const [preview,setPreview]=useState("");
  const [result,setResult]=useState("");
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState("");
  useEffect(()=>{const id=params.get("prompt");if(id){const item=catalog.find(x=>x.id===id);if(item)setPrompt(item.prompt)}},[params]);
  const generate=async()=>{setBusy(true);setError("");setResult("");try{const supabase=supabaseBrowser();if(!supabase)throw new Error("Supabase is not configured.");const {data:{session}}=await supabase.auth.getSession();if(!session?.access_token)throw new Error("Please log in before generating an image.");let reference="";if(file)reference=await new Promise<string>((res,rej)=>{const r=new FileReader();r.onload=()=>res(String(r.result));r.onerror=rej;r.readAsDataURL(file)});const resp=await fetch("/api/generate",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${session.access_token}`},body:JSON.stringify({prompt,reference})});const data=await resp.json();if(!resp.ok)throw new Error(data.error||"Generation failed");setResult(data.image)}catch(e){setError(e instanceof Error?e.message:"Something went wrong")}finally{setBusy(false)}};
  return <><Header/><main className="container detail"><div className="panel"><div className="eyebrow">ZORD CREATE</div><h1 style={{fontFamily:"Space Grotesk",fontSize:42,letterSpacing:-2}}>Make it yours.</h1><div className="form"><div><div className="label">Prompt</div><textarea className="input" rows={9} value={prompt} onChange={e=>setPrompt(e.target.value)} placeholder="Describe what you want to create..."/></div><div><div className="label">Reference image</div><label className="upload">{file?file.name:"Upload a photo or reference image"}<input hidden type="file" accept="image/png,image/jpeg,image/webp" onChange={e=>{const f=e.target.files?.[0]||null;setFile(f);if(f)setPreview(URL.createObjectURL(f))}}/></label>{preview&&<img src={preview} alt="Reference" style={{width:"100%",marginTop:10,borderRadius:14}}/>}</div><div><div className="label">Model</div><select className="input"><option>GPT Image 1.5</option></select></div><button className="btn primary" onClick={generate} disabled={busy||!prompt}>{busy?"Generating...":"Generate image"}</button>{error&&<div className="error">{error}</div>}</div></div><div className="panel"><div className="eyebrow">RESULT</div>{result?<div className="result"><img src={result} alt="Generated result"/><div style={{display:"flex",gap:10,marginTop:12,flexWrap:"wrap"}}><a className="btn" href={result} download="zord-generation.png">Download</a><PublishButton image={result} prompt={prompt}/></div></div>:<div style={{minHeight:430,display:"grid",placeItems:"center",textAlign:"center"}} className="muted">Your generated image will appear here.<br/>Add a reference if you want a personalized result.</div>}</div></main></>;
}
