import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "./supabase";

// ═══════════════════════════════════════════
// STATUS CONFIG
// ═══════════════════════════════════════════
const STATUS_MAP = {
  delivered: { label: "تم التسليم ✓", color: "#10b981", bg: "#10b98118" },
  editing:   { label: "جاري المونتاج", color: "#f59e0b", bg: "#f59e0b18" },
  review:    { label: "في المراجعة",   color: "#6366f1", bg: "#6366f118" },
  filming:   { label: "جاري التصوير", color: "#3b82f6", bg: "#3b82f618" },
};

const TYPE_ICONS = { reel: "📱", youtube: "▶️", podcast: "🎙️", tiktok: "🎵", video: "📹" };

// ═══════════════════════════════════════════
// LOGIN SCREEN
// ═══════════════════════════════════════════
function LoginScreen({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const handleLogin = async () => {
    if (!username || !password) { setError("ادخل اسم المستخدم وكلمة السر"); return; }
    setLoading(true); setError("");
    try {
      const { data, error: err } = await supabase
        .from("clients")
        .select("*")
        .eq("username", username.toLowerCase().trim())
        .eq("password", password)
        .single();
      if (err || !data) { setError("اسم المستخدم أو كلمة السر غلط"); }
      else { onLogin(data); }
    } catch { setError("في مشكلة في الاتصال، حاول تاني"); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight:"100vh", background:"#080810", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Segoe UI',sans-serif", position:"relative", overflow:"hidden" }}>
      <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse 80% 60% at 50% -10%, #1a0a3e, transparent), radial-gradient(ellipse 60% 40% at 80% 80%, #0a1a3e, transparent)" }} />
      <div style={{ position:"absolute", top:"15%", left:"10%", width:300, height:300, background:"#7c3aed08", borderRadius:"50%", filter:"blur(80px)" }} />

      <div style={{ position:"relative", width:"100%", maxWidth:420, padding:"0 20px" }}>
        <div style={{ textAlign:"center", marginBottom:40 }}>
          <div style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", width:64, height:64, background:"linear-gradient(135deg,#7c3aed,#2563eb)", borderRadius:18, marginBottom:16, fontSize:28 }}>🎬</div>
          <h1 style={{ margin:0, fontSize:26, fontWeight:700, color:"#f0ede8", letterSpacing:-0.5 }}>Studio Portal</h1>
          <p style={{ margin:"6px 0 0", fontSize:14, color:"#64748b" }}>بوابة تسليم المحتوى للعملاء</p>
        </div>

        <div style={{ background:"#0f1018", border:"1px solid #ffffff12", borderRadius:20, padding:"32px 28px" }}>
          <div style={{ marginBottom:18 }}>
            <label style={{ display:"block", fontSize:12, color:"#94a3b8", marginBottom:7, letterSpacing:1, textTransform:"uppercase" }}>اسم المستخدم</label>
            <input value={username} onChange={e=>setUsername(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleLogin()}
              placeholder="username"
              style={{ width:"100%", padding:"11px 14px", background:"#ffffff08", border:"1px solid #ffffff15", borderRadius:10, color:"#f0ede8", fontSize:15, outline:"none", boxSizing:"border-box", direction:"ltr" }} />
          </div>
          <div style={{ marginBottom:22 }}>
            <label style={{ display:"block", fontSize:12, color:"#94a3b8", marginBottom:7, letterSpacing:1, textTransform:"uppercase" }}>كلمة السر</label>
            <input value={password} onChange={e=>setPassword(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleLogin()}
              type="password" placeholder="••••••••"
              style={{ width:"100%", padding:"11px 14px", background:"#ffffff08", border:"1px solid #ffffff15", borderRadius:10, color:"#f0ede8", fontSize:15, outline:"none", boxSizing:"border-box" }} />
          </div>
          {error && <div style={{ marginBottom:16, padding:"10px 14px", background:"#ef444415", border:"1px solid #ef444430", borderRadius:8, color:"#f87171", fontSize:13, textAlign:"center" }}>{error}</div>}
          <button onClick={handleLogin} disabled={loading}
            style={{ width:"100%", padding:"12px", background:loading?"#374151":"linear-gradient(135deg,#7c3aed,#2563eb)", border:"none", borderRadius:10, color:"#fff", fontSize:15, fontWeight:600, cursor:loading?"not-allowed":"pointer", transition:"all 0.2s" }}>
            {loading ? "جاري الدخول..." : "دخول →"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// VIDEO CARD
// ═══════════════════════════════════════════
function VideoCard({ project, isAdmin, onStatusChange }) {
  const [expanded, setExpanded] = useState(false);
  const [updating, setUpdating] = useState(false);
  const status = STATUS_MAP[project.status] || STATUS_MAP.editing;

  const handleStatusChange = async (newStatus) => {
    setUpdating(true);
    await onStatusChange(project.id, newStatus);
    setUpdating(false);
  };

  const handleDownload = async () => {
    if (!project.file_url) return;
    await supabase.from("videos").update({ downloads: (project.downloads||0)+1 }).eq("id", project.id);
    window.open(project.file_url, "_blank");
  };

  return (
    <div style={{ background:"#0f1018", border:"1px solid #ffffff0f", borderRadius:14, overflow:"hidden", transition:"all 0.2s" }}
      onMouseEnter={e=>e.currentTarget.style.borderColor="#ffffff20"}
      onMouseLeave={e=>e.currentTarget.style.borderColor="#ffffff0f"}>
      <div style={{ padding:"16px 18px", display:"flex", alignItems:"center", gap:14, cursor:"pointer" }} onClick={()=>setExpanded(!expanded)}>
        <div style={{ width:48, height:48, background:"linear-gradient(135deg,#1e1b4b,#1e3a5f)", borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>
          {TYPE_ICONS[project.type] || "🎬"}
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize:15, fontWeight:600, color:"#f0ede8", marginBottom:4, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{project.title}</div>
          <div style={{ display:"flex", gap:8, alignItems:"center", flexWrap:"wrap" }}>
            <span style={{ fontSize:11, background:status.bg, color:status.color, padding:"2px 9px", borderRadius:20, fontWeight:500 }}>{status.label}</span>
            <span style={{ fontSize:11, color:"#475569" }}>
              {project.created_at ? new Date(project.created_at).toLocaleDateString("ar-EG") : ""} 
              {project.duration ? ` · ${project.duration}` : ""}
            </span>
          </div>
        </div>
        <div style={{ color:"#475569", fontSize:18, transform:expanded?"rotate(180deg)":"none", transition:"transform 0.2s" }}>⌄</div>
      </div>

      {expanded && (
        <div style={{ padding:"0 18px 18px", borderTop:"1px solid #ffffff08" }}>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, margin:"14px 0" }}>
            {[["📦 الحجم", project.file_size||"—"], ["👁 مشاهدات", (project.views||0).toLocaleString()], ["⬇️ تحميل", (project.downloads||0)+" مرة"]].map(([k,v])=>(
              <div key={k} style={{ background:"#ffffff06", borderRadius:8, padding:"10px 12px", textAlign:"center" }}>
                <div style={{ fontSize:11, color:"#64748b", marginBottom:3 }}>{k}</div>
                <div style={{ fontSize:14, fontWeight:600, color:"#e2e8f0" }}>{v}</div>
              </div>
            ))}
          </div>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
            {project.status==="delivered" && project.file_url && (
              <button onClick={handleDownload}
                style={{ flex:1, padding:"9px 14px", background:"linear-gradient(135deg,#7c3aed,#2563eb)", border:"none", borderRadius:8, color:"#fff", fontSize:13, fontWeight:600, cursor:"pointer" }}>
                ⬇️ تحميل الفيديو
              </button>
            )}
            {project.status==="delivered" && !project.file_url && (
              <div style={{ flex:1, padding:"9px 14px", background:"#ffffff08", borderRadius:8, color:"#64748b", fontSize:13, textAlign:"center" }}>
                الفيديو قيد الرفع
              </div>
            )}
            {isAdmin && (
              <select value={project.status} onChange={e=>handleStatusChange(e.target.value)} disabled={updating}
                style={{ padding:"9px 12px", background:"#1e293b", border:"1px solid #ffffff15", borderRadius:8, color:"#94a3b8", fontSize:13, cursor:"pointer" }}>
                {Object.entries(STATUS_MAP).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
              </select>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════
// UPLOAD ZONE
// ═══════════════════════════════════════════
function UploadZone({ clientId, isAdmin, allClients, onUploaded }) {
  const [dragging, setDragging]       = useState(false);
  const [uploading, setUploading]     = useState(false);
  const [progress, setProgress]       = useState(0);
  const [success, setSuccess]         = useState(false);
  const [error, setError]             = useState("");
  const [targetClient, setTargetClient] = useState(clientId);
  const [title, setTitle]             = useState("");
  const [type, setType]               = useState("reel");
  const [duration, setDuration]       = useState("");
  const [file, setFile]               = useState(null);
  const inputRef = useRef();

  const handleDrop = useCallback((e) => {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) { setFile(f); if (!title) setTitle(f.name.replace(/\.[^.]+$/,"")); }
  }, [title]);

  const handleUpload = async () => {
    if (!file || !title) { setError("محتاج تختار ملف وتكتب عنوان"); return; }
    setUploading(true); setError(""); setProgress(0);

    try {
      // Upload file to Supabase Storage
      const ext = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const filePath = `videos/${targetClient}/${fileName}`;

      const { error: uploadErr } = await supabase.storage
        .from("videos")
        .upload(filePath, file, { onUploadProgress: (p) => setProgress(Math.round((p.loaded/p.total)*100)) });

      if (uploadErr) throw uploadErr;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage.from("videos").getPublicUrl(filePath);

      // Save record to DB
      const sizeMB = (file.size / 1024 / 1024).toFixed(1) + " MB";
      const { error: dbErr } = await supabase.from("videos").insert({
        client_id: targetClient,
        title,
        type,
        duration: duration || null,
        status: "delivered",
        file_url: publicUrl,
        file_size: sizeMB,
      });

      if (dbErr) throw dbErr;

      setSuccess(true); setFile(null); setTitle(""); setDuration("");
      setTimeout(() => { setSuccess(false); onUploaded && onUploaded(); }, 2500);
    } catch (e) {
      setError("في مشكلة في الرفع: " + (e.message || "حاول تاني"));
    } finally { setUploading(false); }
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
      {isAdmin && (
        <div>
          <label style={{ fontSize:12, color:"#94a3b8", letterSpacing:1, textTransform:"uppercase", display:"block", marginBottom:7 }}>العميل</label>
          <select value={targetClient} onChange={e=>setTargetClient(e.target.value)}
            style={{ width:"100%", maxWidth:300, padding:"10px 14px", background:"#0f1018", border:"1px solid #ffffff15", borderRadius:10, color:"#f0ede8", fontSize:14 }}>
            {allClients.filter(c=>!c.is_admin).map(c=>(
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      )}

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
        <div>
          <label style={{ fontSize:12, color:"#94a3b8", letterSpacing:1, textTransform:"uppercase", display:"block", marginBottom:7 }}>عنوان الفيديو</label>
          <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="اسم الفيديو"
            style={{ width:"100%", padding:"10px 14px", background:"#0f1018", border:"1px solid #ffffff15", borderRadius:10, color:"#f0ede8", fontSize:14, outline:"none", boxSizing:"border-box" }} />
        </div>
        <div>
          <label style={{ fontSize:12, color:"#94a3b8", letterSpacing:1, textTransform:"uppercase", display:"block", marginBottom:7 }}>النوع</label>
          <select value={type} onChange={e=>setType(e.target.value)}
            style={{ width:"100%", padding:"10px 14px", background:"#0f1018", border:"1px solid #ffffff15", borderRadius:10, color:"#f0ede8", fontSize:14 }}>
            <option value="reel">📱 Reel</option>
            <option value="youtube">▶️ YouTube</option>
            <option value="tiktok">🎵 TikTok</option>
            <option value="podcast">🎙️ Podcast</option>
            <option value="video">📹 Video</option>
          </select>
        </div>
      </div>

      <div>
        <label style={{ fontSize:12, color:"#94a3b8", letterSpacing:1, textTransform:"uppercase", display:"block", marginBottom:7 }}>المدة (اختياري)</label>
        <input value={duration} onChange={e=>setDuration(e.target.value)} placeholder="مثال: 1:30"
          style={{ width:"100%", maxWidth:200, padding:"10px 14px", background:"#0f1018", border:"1px solid #ffffff15", borderRadius:10, color:"#f0ede8", fontSize:14, outline:"none", boxSizing:"border-box" }} />
      </div>

      {/* Drop Zone */}
      <div
        onDragOver={e=>{e.preventDefault();setDragging(true)}}
        onDragLeave={()=>setDragging(false)}
        onDrop={handleDrop}
        onClick={()=>!uploading&&inputRef.current.click()}
        style={{ border:`2px dashed ${dragging?"#7c3aed":file?"#10b981":success?"#10b981":"#ffffff18"}`, borderRadius:14, padding:"28px 20px", textAlign:"center", cursor:"pointer", transition:"all 0.2s", background:dragging?"#7c3aed08":file?"#10b98108":"#ffffff04" }}>
        <input ref={inputRef} type="file" accept="video/*,audio/*" style={{ display:"none" }} onChange={e=>{const f=e.target.files[0];if(f){setFile(f);if(!title)setTitle(f.name.replace(/\.[^.]+$/,""))}}} />
        <div style={{ fontSize:32, marginBottom:8 }}>{success?"✅":file?"📎":"⬆️"}</div>
        <div style={{ color:success?"#10b981":file?"#a78bfa":"#94a3b8", fontSize:14, fontWeight:500 }}>
          {success?"تم الرفع بنجاح!":file?file.name:"اسحب الفيديو هنا أو اضغط للاختيار"}
        </div>
        <div style={{ color:"#475569", fontSize:12, marginTop:4 }}>MP4, MOV, MKV, MP3 — حتى 4GB</div>
      </div>

      {/* Progress */}
      {uploading && (
        <div>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
            <span style={{ fontSize:13, color:"#94a3b8" }}>جاري الرفع...</span>
            <span style={{ fontSize:13, color:"#a78bfa", fontWeight:600 }}>{progress}%</span>
          </div>
          <div style={{ height:6, background:"#ffffff10", borderRadius:3, overflow:"hidden" }}>
            <div style={{ height:"100%", width:`${progress}%`, background:"linear-gradient(90deg,#7c3aed,#2563eb)", borderRadius:3, transition:"width 0.3s" }} />
          </div>
        </div>
      )}

      {error && <div style={{ padding:"10px 14px", background:"#ef444415", border:"1px solid #ef444430", borderRadius:8, color:"#f87171", fontSize:13 }}>{error}</div>}

      {(file && !uploading && !success) && (
        <button onClick={handleUpload}
          style={{ padding:"12px", background:"linear-gradient(135deg,#7c3aed,#2563eb)", border:"none", borderRadius:10, color:"#fff", fontSize:15, fontWeight:600, cursor:"pointer" }}>
          رفع الفيديو ⬆️
        </button>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════
// MAIN DASHBOARD
// ═══════════════════════════════════════════
function Dashboard({ client, onLogout }) {
  const [activeTab, setActiveTab]     = useState("videos");
  const [videos, setVideos]           = useState([]);
  const [allClients, setAllClients]   = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [loading, setLoading]         = useState(true);
  const isAdmin = !!client.is_admin;

  const fetchVideos = useCallback(async () => {
    setLoading(true);
    const targetId = isAdmin ? (selectedClient || client.id) : client.id;
    const { data } = await supabase
      .from("videos")
      .select("*")
      .eq("client_id", targetId)
      .order("created_at", { ascending: false });
    setVideos(data || []);
    setLoading(false);
  }, [client.id, isAdmin, selectedClient]);

  useEffect(() => { fetchVideos(); }, [fetchVideos]);

  useEffect(() => {
    if (isAdmin) {
      supabase.from("clients").select("*").then(({ data }) => {
        setAllClients(data || []);
        if (data && data.length > 0 && !selectedClient) {
          const first = data.find(c => !c.is_admin);
          if (first) setSelectedClient(first.id);
        }
      });
    }
  }, [isAdmin]);

  const handleStatusChange = async (videoId, newStatus) => {
    await supabase.from("videos").update({ status: newStatus }).eq("id", videoId);
    fetchVideos();
  };

  const delivered   = videos.filter(v=>v.status==="delivered").length;
  const inProgress  = videos.filter(v=>v.status!=="delivered").length;

  const tabs = isAdmin
    ? [{ id:"videos", label:"الفيديوهات", icon:"🎬" }, { id:"upload", label:"رفع فيديو", icon:"⬆️" }, { id:"clients", label:"العملاء", icon:"👥" }]
    : [{ id:"videos", label:"فيديوهاتك", icon:"🎬" }, { id:"request", label:"طلب جديد", icon:"✉️" }];

  return (
    <div style={{ minHeight:"100vh", background:"#080810", fontFamily:"'Segoe UI',sans-serif", direction:"rtl", display:"flex" }}>
      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}.fade{animation:fadeIn 0.3s ease forwards}`}</style>

      {/* Sidebar */}
      <div style={{ width:220, background:"#0a0a12", borderLeft:"1px solid #ffffff0a", display:"flex", flexDirection:"column", padding:"24px 16px", flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:32, padding:"0 4px" }}>
          <div style={{ width:36, height:36, background:"linear-gradient(135deg,#7c3aed,#2563eb)", borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>🎬</div>
          <span style={{ fontSize:15, fontWeight:700, color:"#f0ede8" }}>Studio Portal</span>
        </div>

        <div style={{ background:"#ffffff08", borderRadius:12, padding:"12px 14px", marginBottom:24 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:36, height:36, background:"linear-gradient(135deg,#7c3aed44,#2563eb44)", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, fontWeight:700, color:"#a78bfa" }}>{client.avatar}</div>
            <div>
              <div style={{ fontSize:13, fontWeight:600, color:"#e2e8f0" }}>{client.name}</div>
              <div style={{ fontSize:11, color:"#64748b" }}>{client.company || (isAdmin ? "Admin" : "")}</div>
            </div>
          </div>
        </div>

        <nav style={{ flex:1 }}>
          {tabs.map(tab=>(
            <button key={tab.id} onClick={()=>setActiveTab(tab.id)}
              style={{ width:"100%", textAlign:"right", padding:"10px 14px", marginBottom:4, background:activeTab===tab.id?"#7c3aed20":"transparent", border:activeTab===tab.id?"1px solid #7c3aed30":"1px solid transparent", borderRadius:10, color:activeTab===tab.id?"#a78bfa":"#64748b", fontSize:14, cursor:"pointer", transition:"all 0.15s", fontWeight:activeTab===tab.id?600:400 }}>
              {tab.icon} {tab.label}
            </button>
          ))}
        </nav>

        <button onClick={onLogout}
          style={{ width:"100%", padding:"9px", background:"transparent", border:"1px solid #ffffff10", borderRadius:10, color:"#475569", fontSize:13, cursor:"pointer" }}>
          تسجيل خروج
        </button>
      </div>

      {/* Main Content */}
      <div style={{ flex:1, padding:"28px", overflowY:"auto" }}>

        {/* Stats */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:14, marginBottom:28 }}>
          {[
            { label:"إجمالي الفيديوهات", value:videos.length, icon:"🎬", color:"#7c3aed" },
            { label:"تم التسليم", value:delivered, icon:"✅", color:"#10b981" },
            { label:"قيد التنفيذ", value:inProgress, icon:"⚡", color:"#f59e0b" },
          ].map(s=>(
            <div key={s.label} style={{ background:"#0f1018", border:"1px solid #ffffff0a", borderRadius:14, padding:"18px 20px" }}>
              <div style={{ fontSize:22, marginBottom:8 }}>{s.icon}</div>
              <div style={{ fontSize:28, fontWeight:700, color:s.color, marginBottom:2 }}>{s.value}</div>
              <div style={{ fontSize:12, color:"#64748b" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Videos Tab */}
        {activeTab==="videos" && (
          <div className="fade">
            {isAdmin && allClients.length > 0 && (
              <div style={{ display:"flex", gap:8, marginBottom:20, flexWrap:"wrap" }}>
                {allClients.filter(c=>!c.is_admin).map(c=>(
                  <button key={c.id} onClick={()=>setSelectedClient(c.id)}
                    style={{ padding:"7px 16px", borderRadius:20, border:`1px solid ${selectedClient===c.id?"#7c3aed":"#ffffff15"}`, background:selectedClient===c.id?"#7c3aed20":"transparent", color:selectedClient===c.id?"#a78bfa":"#64748b", fontSize:13, cursor:"pointer" }}>
                    {c.name}
                  </button>
                ))}
              </div>
            )}
            <h2 style={{ margin:"0 0 16px", fontSize:18, fontWeight:600, color:"#f0ede8" }}>
              {isAdmin ? `فيديوهات ${allClients.find(c=>c.id===selectedClient)?.name||""}` : "فيديوهاتك"} ({videos.length})
            </h2>
            {loading
              ? <div style={{ textAlign:"center", padding:"40px", color:"#475569" }}>جاري التحميل...</div>
              : videos.length===0
                ? <div style={{ textAlign:"center", padding:"40px", color:"#475569" }}>لا يوجد فيديوهات بعد 🎬</div>
                : <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                    {videos.map(v=><VideoCard key={v.id} project={v} isAdmin={isAdmin} onStatusChange={handleStatusChange} />)}
                  </div>
            }
          </div>
        )}

        {/* Upload Tab (Admin) */}
        {activeTab==="upload" && isAdmin && (
          <div className="fade">
            <h2 style={{ margin:"0 0 6px", fontSize:18, fontWeight:600, color:"#f0ede8" }}>رفع فيديو لعميل</h2>
            <p style={{ margin:"0 0 20px", fontSize:14, color:"#64748b" }}>ارفع الفيديو وهيظهر في بورتال العميل فوراً</p>
            <UploadZone clientId={selectedClient} isAdmin={true} allClients={allClients} onUploaded={fetchVideos} />
          </div>
        )}

        {/* Request Tab (Client) */}
        {activeTab==="request" && !isAdmin && (
          <div className="fade">
            <h2 style={{ margin:"0 0 6px", fontSize:18, fontWeight:600, color:"#f0ede8" }}>طلب فيديو جديد</h2>
            <p style={{ margin:"0 0 20px", fontSize:14, color:"#64748b" }}>وصف الفيديو اللي عايزه وهنتواصل معاك</p>
            <RequestForm clientId={client.id} />
          </div>
        )}

        {/* Clients Tab (Admin) */}
        {activeTab==="clients" && isAdmin && (
          <div className="fade">
            <h2 style={{ margin:"0 0 16px", fontSize:18, fontWeight:600, color:"#f0ede8" }}>كل العملاء</h2>
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {allClients.filter(c=>!c.is_admin).map(c=>(
                <div key={c.id} style={{ background:"#0f1018", border:"1px solid #ffffff0f", borderRadius:14, padding:"18px 20px", display:"flex", alignItems:"center", gap:14 }}>
                  <div style={{ width:44, height:44, background:"linear-gradient(135deg,#7c3aed44,#2563eb44)", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, fontWeight:700, color:"#a78bfa" }}>{c.avatar}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:15, fontWeight:600, color:"#f0ede8" }}>{c.name}</div>
                    <div style={{ fontSize:12, color:"#64748b" }}>{c.company} · @{c.username}</div>
                  </div>
                  <button onClick={()=>{setSelectedClient(c.id);setActiveTab("videos")}}
                    style={{ padding:"7px 14px", background:"#7c3aed20", border:"1px solid #7c3aed30", borderRadius:8, color:"#a78bfa", fontSize:13, cursor:"pointer" }}>
                    عرض الفيديوهات
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════
// REQUEST FORM
// ═══════════════════════════════════════════
function RequestForm({ clientId }) {
  const [msg, setMsg]       = useState("");
  const [sent, setSent]     = useState(false);
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    if (!msg.trim()) return;
    setSending(true);
    await supabase.from("requests").insert({ client_id: clientId, message: msg });
    setSent(true); setMsg("");
    setTimeout(()=>setSent(false), 3000);
    setSending(false);
  };

  return (
    <div>
      <textarea value={msg} onChange={e=>setMsg(e.target.value)}
        placeholder="وصف الفيديو اللي عايزه... النوع، المدة، الأفكار"
        rows={5}
        style={{ width:"100%", padding:"14px", background:"#0f1018", border:"1px solid #ffffff12", borderRadius:12, color:"#f0ede8", fontSize:14, resize:"vertical", boxSizing:"border-box", outline:"none", fontFamily:"inherit" }} />
      {sent && <div style={{ margin:"10px 0", padding:"10px", background:"#10b98115", border:"1px solid #10b98130", borderRadius:8, color:"#10b981", fontSize:13, textAlign:"center" }}>تم إرسال الطلب ✓</div>}
      <button onClick={handleSend} disabled={sending||!msg.trim()}
        style={{ marginTop:10, padding:"11px 28px", background:sending||!msg.trim()?"#374151":"linear-gradient(135deg,#7c3aed,#2563eb)", border:"none", borderRadius:10, color:"#fff", fontSize:14, fontWeight:600, cursor:sending||!msg.trim()?"not-allowed":"pointer" }}>
        {sending?"جاري الإرسال...":"إرسال الطلب ✓"}
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════
// APP ROOT
// ═══════════════════════════════════════════
export default function App() {
  const [client, setClient] = useState(null);

  return client
    ? <Dashboard client={client} onLogout={()=>setClient(null)} />
    : <LoginScreen onLogin={setClient} />;
}
