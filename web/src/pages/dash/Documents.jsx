import { useState, useEffect, useCallback, useRef } from 'react'
import { Upload, Download, Trash2, FileText, Inbox } from 'lucide-react'
import { useAuth } from '../../lib/auth'
import { getDocuments, uploadDocument, getDocumentUrl, deleteDocument, getDocRequests } from '../../lib/store'
import PageHead from '../../components/dash/PageHead'
import SkeuoButton from '../../components/SkeuoButton'

function fmtSize(b) {
  if (!b) return ''
  if (b < 1024) return `${b} B`
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(0)} KB`
  return `${(b / 1024 / 1024).toFixed(1)} MB`
}

export default function Documents() {
  const { user } = useAuth()
  const [docs, setDocs] = useState([])
  const [requests, setRequests] = useState([])
  const [title, setTitle] = useState('')
  const [activeRequest, setActiveRequest] = useState(null)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const fileRef = useRef(null)

  const load = useCallback(async () => {
    const [d, r] = await Promise.all([getDocuments(user.id), getDocRequests(user.id)])
    setDocs(d)
    setRequests(r)
  }, [user.id])

  useEffect(() => { load() }, [load])

  async function onUpload(e) {
    e.preventDefault()
    const file = fileRef.current?.files?.[0]
    if (!file) { setErr('Choose a file first.'); return }
    setBusy(true)
    setErr('')
    try {
      await uploadDocument({ studentId: user.id, file, title: title || activeRequest?.title, requestId: activeRequest?.id })
      setTitle('')
      setActiveRequest(null)
      if (fileRef.current) fileRef.current.value = ''
      await load()
    } catch (e2) {
      setErr(e2.message)
    }
    setBusy(false)
  }

  async function open(doc) {
    try {
      const url = await getDocumentUrl(doc.file_path)
      window.open(url, '_blank', 'noopener')
    } catch (e) {
      setErr(e.message)
    }
  }

  async function remove(doc) {
    if (!confirm(`Delete "${doc.title}"?`)) return
    await deleteDocument(doc)
    load()
  }

  const pending = requests.filter((r) => r.status === 'pending')

  return (
    <div>
      <PageHead eyebrow="documents" title="Documents">
        Upload documents about your startup. Your mentor and admin can view them.
      </PageHead>

      {pending.length > 0 && (
        <div className="brutal mb-6 p-5" style={{ background: 'var(--yellow)' }}>
          <div className="eyebrow mb-2 flex items-center gap-2"><Inbox size={14} /> requested documents</div>
          <div className="space-y-2">
            {pending.map((r) => (
              <div key={r.id} className="brutal-flat flex flex-wrap items-center justify-between gap-2 bg-white p-2.5 text-sm">
                <div>
                  <span className="font-bold">{r.title}</span>
                  {r.note && <span className="text-[var(--muted)]"> — {r.note}</span>}
                  {r.by_name && <span className="text-xs text-[var(--muted)]"> · asked by {r.by_name}</span>}
                </div>
                <button className="btn btn-light btn-sm" onClick={() => { setActiveRequest(r); setTitle(r.title) }}>Upload this</button>
              </div>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={onUpload} className="brutal mb-6 p-5">
        <div className="eyebrow mb-3 flex items-center gap-2"><Upload size={14} /> upload a document</div>
        {activeRequest && (
          <div className="mb-2 text-xs font-bold text-[var(--blue)]">
            Fulfilling request: {activeRequest.title}
            <button type="button" className="ml-2 underline" onClick={() => { setActiveRequest(null); setTitle('') }}>cancel</button>
          </div>
        )}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <input
            className="w-full brutal-flat bg-white px-3 py-2 text-sm outline-none focus:shadow-[3px_3px_0_var(--blue)]"
            placeholder="Title (e.g. Pitch deck)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <input ref={fileRef} type="file" className="w-full text-sm file:mr-3 file:border-0 file:bg-[var(--blue)] file:px-3 file:py-2 file:text-white" />
        </div>
        {err && <p className="mt-2 text-xs font-bold text-[#c0392b]">{err}</p>}
        <SkeuoButton type="submit" size="sm" className="mt-3" disabled={busy}>{busy ? 'Uploading…' : 'Upload'}</SkeuoButton>
      </form>

      <div className="brutal p-5">
        <div className="eyebrow mb-3 flex items-center gap-2"><FileText size={14} /> your documents</div>
        {docs.length === 0 ? (
          <p className="text-sm text-[var(--ink-soft)]">No documents yet.</p>
        ) : (
          <div className="space-y-2">
            {docs.map((d) => (
              <div key={d.id} className="brutal-flat flex flex-wrap items-center justify-between gap-2 p-3 text-sm">
                <div>
                  <div className="font-bold">{d.title}</div>
                  <div className="text-xs text-[var(--muted)]">{d.file_name} · {fmtSize(d.size)} · {new Date(d.created_at).toLocaleDateString()}</div>
                </div>
                <div className="flex gap-2">
                  <button className="btn btn-light btn-sm" onClick={() => open(d)}><Download size={13} /> Open</button>
                  <button className="btn btn-light btn-sm" onClick={() => remove(d)} aria-label="Delete"><Trash2 size={13} /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
