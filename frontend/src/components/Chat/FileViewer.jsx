import React from 'react'
import { X, Download, ExternalLink, Share2, ZoomIn, ZoomOut, FileText, File } from 'lucide-react'

const FileViewer = ({ file, onClose }) => {
  const [zoom, setZoom] = React.useState(100)
  const [fitMode, setFitMode] = React.useState('actual')

  if (!file) return null
  const fileUrl = file.url?.startsWith('http') 
    ? file.url 
    : `http://localhost:3002${file.url}`

  const isImage = file.type?.startsWith('image/')
  const isVideo = file.type?.startsWith('video/')
  const isPDF = file.type === 'application/pdf'
  
  const isOfficeDoc = file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
                      file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
                      file.type === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' ||
                      file.type === 'application/msword' ||
                      file.type === 'application/vnd.ms-excel' ||
                      file.type === 'application/vnd.ms-powerpoint'
  
  const getFileExtension = () => {
    const name = file.name || ''
    const ext = name.split('.').pop()?.toUpperCase()
    return ext || 'FILE'
  }
  
  const getFileTypeName = () => {
    if (file.type?.includes('presentation')) return 'PowerPoint Presentation'
    if (file.type?.includes('word')) return 'Word Document'
    if (file.type?.includes('sheet')) return 'Excel Spreadsheet'
    if (file.type?.includes('pdf')) return 'PDF Document'
    return 'Document'
  }

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = fileUrl
    link.download = file.name
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleOpenNewTab = () => {
    window.open(fileUrl, '_blank', 'noopener,noreferrer')
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: file.name,
          text: `Check out this file: ${file.name}`,
          url: fileUrl
        })
      } catch (err) {
        console.log('Share cancelled or not supported')
      }
    } else {
      navigator.clipboard.writeText(fileUrl)
      alert('Link copied to clipboard!')
    }
  }

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 50, 400))
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 50, 25))
  const toggleFitMode = () => {
    setFitMode(prev => prev === 'fit' ? 'actual' : 'fit')
    setZoom(100)
  }

  const handleWheel = (e) => {
    if (e.ctrlKey && isImage) {
      e.preventDefault()
      if (e.deltaY < 0) {
        handleZoomIn()
      } else {
        handleZoomOut()
      }
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4">
      <div className="absolute top-0 left-0 right-0 z-10 bg-gray-900 bg-opacity-80 backdrop-blur-sm text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <h3 className="text-lg font-medium truncate">{file.name}</h3>
          {file.size && (
            <span className="text-sm text-gray-300">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {isImage && (
            <>
              <button
                onClick={toggleFitMode}
                className="px-3 py-2 hover:bg-gray-700 rounded-lg transition-colors text-sm font-medium"
                title={fitMode === 'fit' ? 'View actual size' : 'Fit to screen'}
              >
                {fitMode === 'fit' ? 'Actual Size' : 'Fit Screen'}
              </button>
              <div className="w-px h-6 bg-gray-600 mx-1"></div>
              <button
                onClick={handleZoomOut}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                title="Zoom Out"
                disabled={zoom <= 25}
              >
                <ZoomOut className="w-5 h-5" />
              </button>
              <span className="text-sm px-2 min-w-[60px] text-center">{zoom}%</span>
              <button
                onClick={handleZoomIn}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                title="Zoom In"
                disabled={zoom >= 400}
              >
                <ZoomIn className="w-5 h-5" />
              </button>
              <div className="w-px h-6 bg-gray-600 mx-2"></div>
            </>
          )}

          <button
            onClick={handleShare}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            title="Share"
          >
            <Share2 className="w-5 h-5" />
          </button>
          <button
            onClick={handleOpenNewTab}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            title="Open in New Tab"
          >
            <ExternalLink className="w-5 h-5" />
          </button>
          <button
            onClick={handleDownload}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            title="Download"
          >
            <Download className="w-5 h-5" />
          </button>
          <div className="w-px h-6 bg-gray-600 mx-2"></div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div 
        className="relative w-full h-full flex items-center justify-center p-20 overflow-auto"
        onClick={onClose}
        onWheel={handleWheel}
      >
        <div onClick={(e) => e.stopPropagation()} className="relative">
          {isImage ? (
            <img
              src={fileUrl}
              alt={file.name}
              className="rounded-lg shadow-2xl"
              style={{ 
                maxWidth: fitMode === 'fit' ? '90vw' : 'none',
                maxHeight: fitMode === 'fit' ? '85vh' : 'none',
                width: fitMode === 'actual' ? 'auto' : undefined,
                height: fitMode === 'actual' ? 'auto' : undefined,
                transform: `scale(${zoom / 100})`,
                transformOrigin: 'center',
                transition: 'transform 0.2s ease'
              }}
            />
          ) : isVideo ? (
            <video
              src={fileUrl}
              controls
              autoPlay
              className="max-w-[90vw] max-h-[85vh] rounded-lg shadow-2xl"
            >
              Your browser does not support video playback.
            </video>
          ) : isPDF ? (
            <iframe
              src={fileUrl}
              className="w-[90vw] h-[85vh] rounded-lg shadow-2xl bg-white"
              title={file.name}
            />
          ) : isOfficeDoc ? (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-12 max-w-2xl mx-auto shadow-2xl border border-blue-100">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mb-6 shadow-lg">
                  <div className="text-white">
                    <div className="text-4xl font-bold">{getFileExtension()}</div>
                  </div>
                </div>
                
                <h3 className="text-2xl font-bold text-gray-900 mb-2 break-words px-4">
                  {file.name}
                </h3>
                <p className="text-blue-600 font-medium mb-1">
                  {getFileTypeName()}
                </p>
                {file.size && (
                  <p className="text-gray-500 text-sm mb-6">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                )}
                
                <div className="bg-blue-100 border border-blue-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-blue-800">
                    <FileText className="w-4 h-4 inline mr-2" />
                    Office documents cannot be previewed directly in the browser.
                    <br />
                    Download the file to view it in Microsoft Office or compatible software.
                  </p>
                </div>
                
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={handleDownload}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl inline-flex items-center gap-2 font-medium"
                  >
                    <Download className="w-5 h-5" />
                    Download File
                  </button>
                  <button
                    onClick={handleOpenNewTab}
                    className="px-6 py-3 bg-white text-gray-700 rounded-lg hover:bg-gray-50 transition-colors border border-gray-300 shadow-sm inline-flex items-center gap-2 font-medium"
                  >
                    <ExternalLink className="w-5 h-5" />
                    Open
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg p-12 text-center">
              <Download className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Preview not available
              </h3>
              <p className="text-gray-600 mb-6">
                This file type cannot be previewed in the browser
              </p>
              <button
                onClick={handleDownload}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
              >
                <Download className="w-5 h-5" />
                Download File
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm opacity-70 text-center">
        {isImage ? (
          <div>
            <div>Click outside to close • Press ESC • Ctrl+Scroll to zoom</div>
          </div>
        ) : (
          <div>Click outside to close or press ESC</div>
        )}
      </div>
    </div>
  )
}

export default FileViewer
