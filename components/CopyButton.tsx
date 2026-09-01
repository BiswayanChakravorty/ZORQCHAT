"use client";
import {useState} from "react";
export default function CopyButton({text}:{text:string}){const [copied,setCopied]=useState(false);return <button className="btn" onClick={async()=>{await navigator.clipboard.writeText(text);setCopied(true);setTimeout(()=>setCopied(false),1200)}}>{copied?"Copied":"Copy Prompt"}</button>}
