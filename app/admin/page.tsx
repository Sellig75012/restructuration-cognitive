'use client'

import { useState, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import { DISTORSIONS } from '@/lib/distorsions'

interface UserWithStats {
  id: number
  email: string
  name: string
  role: string
  status: string
  created_at: string
  fiches_count: number
  last_entry: string | null
}

interface Fiche {
  id: number
  date: string
  situation: string
  emotion_initiale: string
  emotion_initiale_pct: number
  distorsions_identifiees: string[]
  pensees_adaptees: string
  emotion_finale: string
  emotion_finale_pct: number
  action: string
  questionnement: string
  pensees_automatiques: string
  notes: string
}

export default function AdminPage() {
  const [users, setUsers] = useState<UserWithStats[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [newEmail, setNewEmail] = useState('')
  const [newName, setNewName] = useState('')
  const [newRole, setNewRole] = useState('user')
  const [creating, setCreating] = useState(false)
  const [selectedUser, setSelectedUser] = useState<string | null>(null)
  const [userFiches, setUserFiches] = useState<Fiche[]>([])
  const [loadingFiches, setLoadingFiches] = useState(false)
  const [editingUser, setEditingUser] = useState<number | null>(null)

  const loadUsers = async () => {
    const res = await fetch('/api/admin/users/stats')
    if (res.ok) setUsers(await res.json())
    setLoading(false)
  }

  useEffect(() => { loadUsers() }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: newEmail, name: newName, role: newRole }),
    })
    if (res.ok) {
      setNewEmail('')
      setNewName('')
      setNewRole('user')
      setShowCreate(false)
      loadUsers()
    } else {
      const data = await res.json()
      alert(data.error || 'Erreur')
    }
    setCreating(false)
  }

  const handleStatusChange = async (id: number, status: string) => {
    await fetch('/api/admin/users', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    })
    loadUsers()
  }

  const handleRoleChange = async (id: number, role: string) => {
    await fetch('/api/admin/users', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, role }),
    })
    loadUsers()
  }

  const viewFiches = async (email: string) => {
    if (selectedUser === email) {
      setSelectedUser(null)
      return
    }
    setSelectedUser(email)
    setLoadingFiches(true)
    const res = await fetch(`/api/admin/fiches?email=${encodeURIComponent(email)}`)
    if (res.ok) setUserFiches(await res.json())
    setLoadingFiches(false)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700'
      case 'pending': return 'bg-yellow-100 text-yellow-700'
      case 'rejected': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <>
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Administration</h1>
            <p className="text-gray-500">{users.length} utilisateur{users.length > 1 ? 's' : ''}</p>
          </div>
          <button onClick={() => setShowCreate(!showCreate)} className="btn-primary">
            + Nouvel utilisateur
          </button>
        </div>

        {/* Create user form */}
        {showCreate && (
          <div className="card mb-6 animate-fade-in">
            <h2 className="font-semibold text-gray-900 mb-4">Créer un utilisateur</h2>
            <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <input
                type="email"
                value={newEmail}
                onChange={e => setNewEmail(e.target.value)}
                placeholder="Email"
                className="input-field"
                required
              />
              <input
                type="text"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="Nom"
                className="input-field"
              />
              <select
                value={newRole}
                onChange={e => setNewRole(e.target.value)}
                className="input-field"
              >
                <option value="user">Utilisateur</option>
                <option value="admin">Administrateur</option>
              </select>
              <button type="submit" disabled={creating} className="btn-primary disabled:opacity-50">
                {creating ? 'Création...' : 'Créer'}
              </button>
            </form>
          </div>
        )}

        {loading ? (
          <div className="text-center py-16 text-gray-400">Chargement...</div>
        ) : (
          <div className="space-y-4">
            {users.map(user => (
              <div key={user.id} className="card animate-fade-in">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold">
                      {(user.name || user.email).charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{user.name || user.email}</h3>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${getStatusBadge(user.status)}`}>
                      {user.status}
                    </span>
                    <span className="text-xs text-gray-400 bg-gray-50 px-2.5 py-1 rounded-full">
                      {user.role}
                    </span>
                    <span className="text-sm font-medium text-primary-600">
                      {user.fiches_count} fiche{user.fiches_count > 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-50">
                  {user.status === 'pending' && (
                    <>
                      <button onClick={() => handleStatusChange(user.id, 'active')} className="text-sm text-green-600 font-medium hover:underline">
                        Approuver
                      </button>
                      <button onClick={() => handleStatusChange(user.id, 'rejected')} className="text-sm text-red-600 font-medium hover:underline">
                        Rejeter
                      </button>
                    </>
                  )}
                  {user.status === 'active' && user.role !== 'admin' && (
                    <button onClick={() => handleStatusChange(user.id, 'rejected')} className="text-sm text-red-500 hover:underline">
                      Désactiver
                    </button>
                  )}
                  {user.status === 'rejected' && (
                    <button onClick={() => handleStatusChange(user.id, 'active')} className="text-sm text-green-600 hover:underline">
                      Réactiver
                    </button>
                  )}
                  <button onClick={() => handleRoleChange(user.id, user.role === 'admin' ? 'user' : 'admin')} className="text-sm text-gray-500 hover:underline ml-2">
                    {user.role === 'admin' ? 'Rétrograder' : 'Promouvoir admin'}
                  </button>
                  {user.fiches_count > 0 && (
                    <button
                      onClick={() => viewFiches(user.email)}
                      className="text-sm text-primary-500 font-medium hover:underline ml-auto"
                    >
                      {selectedUser === user.email ? 'Masquer les fiches' : 'Voir les fiches'}
                    </button>
                  )}
                </div>

                {/* User fiches */}
                {selectedUser === user.email && (
                  <div className="mt-4 pt-4 border-t border-gray-100 animate-fade-in">
                    {loadingFiches ? (
                      <p className="text-gray-400 text-sm">Chargement...</p>
                    ) : (
                      <div className="space-y-3">
                        <h4 className="font-medium text-gray-700">Fiches de {user.name || user.email}</h4>
                        {userFiches.map(fiche => (
                          <div key={fiche.id} className="bg-gray-50 rounded-xl p-4">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-sm text-gray-400 font-mono">
                                {new Date(fiche.date).toLocaleDateString('fr-FR')}
                              </span>
                              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-50 text-red-600">
                                {fiche.emotion_initiale} {fiche.emotion_initiale_pct}%
                              </span>
                              <span className="text-gray-300">→</span>
                              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-50 text-green-600">
                                {fiche.emotion_finale} {fiche.emotion_finale_pct}%
                              </span>
                            </div>
                            <p className="text-sm text-gray-800 font-medium mb-1">{fiche.situation}</p>
                            <p className="text-sm text-gray-500 mb-2">{fiche.pensees_automatiques}</p>
                            {fiche.pensees_adaptees && (
                              <p className="text-sm text-green-700 italic">→ {fiche.pensees_adaptees}</p>
                            )}
                            {fiche.distorsions_identifiees.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {fiche.distorsions_identifiees.map(d => {
                                  const dist = DISTORSIONS.find(dd => dd.nom === d)
                                  return (
                                    <span key={d} className="text-xs px-2 py-0.5 rounded-full"
                                      style={{ backgroundColor: `${dist?.couleur || '#6b7280'}15`, color: dist?.couleur || '#6b7280' }}>
                                      {d}
                                    </span>
                                  )
                                })}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  )
}
