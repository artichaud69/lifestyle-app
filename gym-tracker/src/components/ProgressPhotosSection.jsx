import { useEffect, useRef, useState } from 'react'
import Sheet from './Sheet.jsx'
import { PlusIcon, CameraIcon } from '../lib/icons.jsx'
import { todayISO, formatDate, formatDateShort } from '../lib/dates.js'
import { listPhotos, addPhoto, deletePhoto, compressImage } from '../lib/photoStore.js'
import { genId } from '../lib/id.js'

// Object URLs are created per blob and must be revoked once nothing points
// at them any more, or every reload/refresh leaks another one for the tab's
// lifetime — this hook owns that whole lifecycle in one place.
function useObjectURLs(photos) {
  const [urls, setUrls] = useState({})
  useEffect(() => {
    const next = {}
    for (const photo of photos) next[photo.id] = URL.createObjectURL(photo.blob)
    setUrls(next)
    return () => {
      for (const url of Object.values(next)) URL.revokeObjectURL(url)
    }
  }, [photos])
  return urls
}

function AddPhotoForm({ onSave, onCancel }) {
  const [date, setDate] = useState(todayISO())
  const [note, setNote] = useState('')
  const [pendingBlob, setPendingBlob] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [error, setError] = useState('')
  const fileInputRef = useRef(null)

  async function handleFile(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setError('')
    try {
      const blob = await compressImage(file)
      setPendingBlob(blob)
      setPreviewUrl(URL.createObjectURL(blob))
    } catch {
      setError('Could not use that photo — try a different one.')
    }
  }

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  return (
    <div className="card card-tight" style={{ marginBottom: 'var(--space-3)' }}>
      {previewUrl ? (
        <div className="library-image-wrap" style={{ maxWidth: 220, marginBottom: 'var(--space-3)' }}>
          <img src={previewUrl} alt="Selected photo preview" />
        </div>
      ) : (
        <button type="button" className="btn btn-secondary" onClick={() => fileInputRef.current?.click()}>
          <CameraIcon size={18} /> Choose Photo
        </button>
      )}
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />

      {pendingBlob && (
        <>
          <div className="field" style={{ marginTop: 'var(--space-3)' }}>
            <label>Date</label>
            <input type="date" value={date} max={todayISO()} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="field">
            <label>Note (optional)</label>
            <input type="text" value={note} placeholder="e.g. after 8 weeks cutting" onChange={(e) => setNote(e.target.value)} />
          </div>
          <div className="btn-block-row">
            <button type="button" className="btn btn-ghost" onClick={onCancel}>
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => onSave({ id: genId(), date, note: note.trim(), blob: pendingBlob })}
            >
              Save
            </button>
          </div>
        </>
      )}

      {error && (
        <div className="feedback-card warning" style={{ marginTop: 'var(--space-2)' }}>
          <p>{error}</p>
        </div>
      )}
    </div>
  )
}

function CompareSheet({ photos, urls, onClose }) {
  const [leftId, setLeftId] = useState(photos[0].id)
  const [rightId, setRightId] = useState(photos[photos.length - 1].id)
  const left = photos.find((p) => p.id === leftId)
  const right = photos.find((p) => p.id === rightId)

  return (
    <Sheet title="Compare Progress" onClose={onClose}>
      <div className="library-image-row">
        <div className="library-image-wrap">
          <img src={urls[left.id]} alt={`Progress photo from ${formatDate(left.date)}`} />
          <span className="library-image-label">{formatDateShort(left.date)}</span>
        </div>
        <div className="library-image-wrap">
          <img src={urls[right.id]} alt={`Progress photo from ${formatDate(right.date)}`} />
          <span className="library-image-label">{formatDateShort(right.date)}</span>
        </div>
      </div>
      <div className="set-row" style={{ gridTemplateColumns: '1fr 1fr' }}>
        <select value={leftId} onChange={(e) => setLeftId(e.target.value)}>
          {photos.map((p) => (
            <option key={p.id} value={p.id}>
              {formatDate(p.date)}
            </option>
          ))}
        </select>
        <select value={rightId} onChange={(e) => setRightId(e.target.value)}>
          {photos.map((p) => (
            <option key={p.id} value={p.id}>
              {formatDate(p.date)}
            </option>
          ))}
        </select>
      </div>
    </Sheet>
  )
}

function ProgressPhotosSection() {
  const [photos, setPhotos] = useState([])
  const [loaded, setLoaded] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [viewingId, setViewingId] = useState(null)
  const [comparing, setComparing] = useState(false)
  const urls = useObjectURLs(photos)

  function refresh() {
    listPhotos().then((result) => {
      setPhotos(result)
      setLoaded(true)
    })
  }

  useEffect(() => {
    refresh()
  }, [])

  async function handleSave(photo) {
    await addPhoto(photo)
    setShowForm(false)
    refresh()
  }

  async function handleDelete(id) {
    await deletePhoto(id)
    setViewingId(null)
    refresh()
  }

  const viewing = photos.find((p) => p.id === viewingId)
  const gallery = [...photos].reverse()

  return (
    <div className="card">
      <div className="card-title-row">
        <h2>Progress Photos</h2>
        <button type="button" className="icon-btn" onClick={() => setShowForm((s) => !s)} aria-label="Add progress photo">
          <PlusIcon size={18} />
        </button>
      </div>

      {showForm && <AddPhotoForm onSave={handleSave} onCancel={() => setShowForm(false)} />}

      {!loaded ? null : photos.length === 0 ? (
        <div className="empty-state" style={{ padding: 'var(--space-4) 0' }}>
          <CameraIcon size={32} />
          <p style={{ marginBottom: 0 }}>No photos yet — add one every few weeks to see your progress side by side.</p>
        </div>
      ) : (
        <>
          {photos.length > 1 && (
            <button type="button" className="btn btn-secondary" style={{ marginBottom: 'var(--space-3)' }} onClick={() => setComparing(true)}>
              Compare Oldest vs Newest
            </button>
          )}
          <div className="photo-grid">
            {gallery.map((photo) => (
              <button key={photo.id} type="button" className="photo-thumb" onClick={() => setViewingId(photo.id)}>
                <img src={urls[photo.id]} alt={`Progress photo from ${formatDate(photo.date)}`} />
                <span className="photo-thumb-date">{formatDateShort(photo.date)}</span>
              </button>
            ))}
          </div>
        </>
      )}

      {viewing && (
        <Sheet title={formatDate(viewing.date)} onClose={() => setViewingId(null)}>
          <div className="library-image-wrap" style={{ marginBottom: 'var(--space-3)' }}>
            <img src={urls[viewing.id]} alt={`Progress photo from ${formatDate(viewing.date)}`} />
          </div>
          {viewing.note && <p>{viewing.note}</p>}
          <button type="button" className="btn btn-danger" onClick={() => handleDelete(viewing.id)}>
            Delete Photo
          </button>
        </Sheet>
      )}

      {comparing && photos.length > 1 && <CompareSheet photos={photos} urls={urls} onClose={() => setComparing(false)} />}
    </div>
  )
}

export default ProgressPhotosSection
