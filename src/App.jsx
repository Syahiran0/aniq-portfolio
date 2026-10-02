import { lazy, Suspense, useEffect } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { useContent } from './content/store'
import Home from './pages/Home'

// The dashboard is code-split: visitors never download it.
const AdminPage = lazy(() => import('./admin/AdminPage'))

function useDocumentMeta() {
  const { site } = useContent()
  const { pathname } = useLocation()
  const isAdmin = pathname.startsWith('/admin')

  useEffect(() => {
    document.title = isAdmin ? 'Dashboard · Portfolio' : site.title
    const setMeta = (name, value) => {
      let el = document.head.querySelector(`meta[name="${name}"]`)
      if (!el) {
        el = document.createElement('meta')
        el.name = name
        document.head.appendChild(el)
      }
      el.content = value
    }
    setMeta('description', site.description)
    setMeta('robots', isAdmin ? 'noindex, nofollow' : 'index, follow')
  }, [site.title, site.description, isAdmin])
}

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

export default function App() {
  useDocumentMeta()
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/admin"
          element={
            <Suspense fallback={null}>
              <AdminPage />
            </Suspense>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}
