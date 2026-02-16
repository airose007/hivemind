'use client'

import { useState, useEffect } from 'react'

const FILE_NAMES = ['SOUL.md', 'AGENTS.md', 'TOOLS.md', 'HEARTBEAT.md']

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'config' | 'files' | 'system'>('config')
  const [config, setConfig] = useState('')
  const [files, setFiles] = useState<Record<string, string>>({})
  const [selectedFile, setSelectedFile] = useState('SOUL.md')
  const [system, setSystem] = useState<any>(null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (activeTab === 'config') {
      loadConfig()
    } else if (activeTab === 'files') {
      loadFiles()
    } else if (activeTab === 'system') {
      loadSystem()
    }
  }, [activeTab])

  const loadConfig = async () => {
    try {
      const res = await fetch('/api/settings/config')
      const data = await res.json()
      setConfig(data.content || '')
    } catch (error) {
      setMessage('Failed to load config')
    }
  }

  const saveConfig = async () => {
    setSaving(true)
    setMessage('')
    try {
      const res = await fetch('/api/settings/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: config }),
      })
      if (res.ok) {
        setMessage('Config saved successfully')
      } else {
        const data = await res.json()
        setMessage(data.error || 'Failed to save config')
      }
    } catch (error) {
      setMessage('Network error')
    }
    setSaving(false)
  }

  const loadFiles = async () => {
    const loaded: Record<string, string> = {}
    for (const fileName of FILE_NAMES) {
      try {
        const res = await fetch(`/api/settings/files/${fileName}`)
        const data = await res.json()
        loaded[fileName] = data.content || ''
      } catch (error) {
        loaded[fileName] = ''
      }
    }
    setFiles(loaded)
  }

  const saveFile = async () => {
    setSaving(true)
    setMessage('')
    try {
      const res = await fetch(`/api/settings/files/${selectedFile}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: files[selectedFile] || '' }),
      })
      if (res.ok) {
        setMessage(`${selectedFile} saved successfully`)
      } else {
        setMessage('Failed to save file')
      }
    } catch (error) {
      setMessage('Network error')
    }
    setSaving(false)
  }

  const loadSystem = async () => {
    try {
      const res = await fetch('/api/settings/system')
      const data = await res.json()
      setSystem(data.system)
    } catch (error) {
      setMessage('Failed to load system info')
    }
  }

  const restartOpenClaw = async () => {
    if (!confirm('Are you sure you want to restart OpenClaw?')) return
    try {
      await fetch('/api/settings/restart', { method: 'POST' })
      setMessage('Restart command sent. OpenClaw will restart shortly.')
    } catch (error) {
      setMessage('Failed to send restart command')
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">Settings</h1>

      {/* Tabs — scrollable on mobile */}
      <div className="flex gap-2 mb-4 sm:mb-6 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0">
        <button
          onClick={() => setActiveTab('config')}
          className={`px-3 sm:px-4 py-2 rounded-lg transition-colors whitespace-nowrap text-sm sm:text-base ${
            activeTab === 'config'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-900 text-gray-300 hover:bg-gray-800'
          }`}
        >
          Config Editor
        </button>
        <button
          onClick={() => setActiveTab('files')}
          className={`px-3 sm:px-4 py-2 rounded-lg transition-colors whitespace-nowrap text-sm sm:text-base ${
            activeTab === 'files'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-900 text-gray-300 hover:bg-gray-800'
          }`}
        >
          Agent Files
        </button>
        <button
          onClick={() => setActiveTab('system')}
          className={`px-3 sm:px-4 py-2 rounded-lg transition-colors whitespace-nowrap text-sm sm:text-base ${
            activeTab === 'system'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-900 text-gray-300 hover:bg-gray-800'
          }`}
        >
          System
        </button>
      </div>

      {message && (
        <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg text-blue-300 text-sm sm:text-base">
          {message}
        </div>
      )}

      {/* Config Tab */}
      {activeTab === 'config' && (
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4 gap-3">
            <h2 className="text-lg sm:text-xl font-semibold truncate">openclaw.json</h2>
            <button
              onClick={saveConfig}
              disabled={saving}
              className="px-3 sm:px-4 py-1.5 sm:py-2 text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white rounded-lg transition-colors whitespace-nowrap"
            >
              {saving ? 'Saving...' : 'Save Config'}
            </button>
          </div>
          <textarea
            value={config}
            onChange={(e) => setConfig(e.target.value)}
            className="w-full h-72 sm:h-96 px-3 sm:px-4 py-2 sm:py-3 bg-gray-950 border border-gray-800 rounded-lg font-mono text-xs sm:text-sm focus:outline-none focus:border-blue-600 resize-none"
            spellCheck={false}
          />
        </div>
      )}

      {/* Files Tab */}
      {activeTab === 'files' && (
        <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
          {/* Mobile: horizontal file selector */}
          <div className="sm:hidden flex gap-2 p-3 overflow-x-auto border-b border-gray-800 bg-gray-950">
            {FILE_NAMES.map((fileName) => (
              <button
                key={fileName}
                onClick={() => setSelectedFile(fileName)}
                className={`px-3 py-1.5 rounded text-sm transition-colors whitespace-nowrap ${
                  selectedFile === fileName
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800 bg-gray-900'
                }`}
              >
                {fileName}
              </button>
            ))}
          </div>

          <div className="flex">
            {/* Desktop: file selector sidebar */}
            <div className="hidden sm:block w-48 bg-gray-950 border-r border-gray-800 p-4">
              {FILE_NAMES.map((fileName) => (
                <button
                  key={fileName}
                  onClick={() => setSelectedFile(fileName)}
                  className={`w-full text-left px-3 py-2 rounded mb-1 transition-colors ${
                    selectedFile === fileName
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800'
                  }`}
                >
                  {fileName}
                </button>
              ))}
            </div>

            {/* File editor */}
            <div className="flex-1 p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4 gap-3">
                <h2 className="text-lg sm:text-xl font-semibold truncate">{selectedFile}</h2>
                <button
                  onClick={saveFile}
                  disabled={saving}
                  className="px-3 sm:px-4 py-1.5 sm:py-2 text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 text-white rounded-lg transition-colors whitespace-nowrap"
                >
                  {saving ? 'Saving...' : 'Save File'}
                </button>
              </div>
              <textarea
                value={files[selectedFile] || ''}
                onChange={(e) =>
                  setFiles({ ...files, [selectedFile]: e.target.value })
                }
                className="w-full h-72 sm:h-96 px-3 sm:px-4 py-2 sm:py-3 bg-gray-950 border border-gray-800 rounded-lg font-mono text-xs sm:text-sm focus:outline-none focus:border-blue-600 resize-none"
                spellCheck={false}
              />
            </div>
          </div>
        </div>
      )}

      {/* System Tab */}
      {activeTab === 'system' && system && (
        <div className="space-y-4 sm:space-y-6">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Server Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <div className="text-gray-400 text-xs sm:text-sm">Hostname</div>
                <div className="font-mono text-sm sm:text-base truncate">{system.hostname}</div>
              </div>
              <div>
                <div className="text-gray-400 text-xs sm:text-sm">Platform</div>
                <div className="font-mono text-sm sm:text-base">
                  {system.platform} ({system.arch})
                </div>
              </div>
              <div>
                <div className="text-gray-400 text-xs sm:text-sm">Uptime</div>
                <div className="font-mono text-sm sm:text-base">{system.uptimeFormatted}</div>
              </div>
              <div>
                <div className="text-gray-400 text-xs sm:text-sm">OpenClaw Version</div>
                <div className="font-mono text-sm sm:text-base">{system.openclawVersion}</div>
              </div>
              <div>
                <div className="text-gray-400 text-xs sm:text-sm">CPU</div>
                <div className="font-mono text-sm sm:text-base truncate">
                  {system.cpu.count}x {system.cpu.model.split(' ')[0]}
                </div>
              </div>
              <div>
                <div className="text-gray-400 text-xs sm:text-sm">Memory Usage</div>
                <div className="font-mono text-sm sm:text-base">
                  {Math.round(system.memory.used / 1024 / 1024 / 1024)}GB /{' '}
                  {Math.round(system.memory.total / 1024 / 1024 / 1024)}GB (
                  {system.memory.usagePercent}%)
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-lg p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Actions</h2>
            <button
              onClick={restartOpenClaw}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm sm:text-base"
            >
              🔄 Restart OpenClaw
            </button>
            <p className="text-xs sm:text-sm text-gray-400 mt-2">
              This will restart the OpenClaw gateway service.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
