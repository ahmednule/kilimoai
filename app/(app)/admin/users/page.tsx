'use client'

import { useState } from 'react'
import { Users, Search, Sprout, Shield, Store, ShoppingCart, ShieldCheck, Ban, CheckCircle2 } from 'lucide-react'

interface User {
  id: string; name: string; email: string; role: string; county: string; status: string; joined: string
}

const USERS: User[] = [
  { id: 'U-001', name: 'Grace Wanjiku', email: 'grace.w@email.com', role: 'farmer', county: 'Nakuru', status: 'active', joined: '2026-01-15' },
  { id: 'U-002', name: 'Peter Kamau', email: 'peter.k@email.com', role: 'farmer', county: 'Uasin Gishu', status: 'active', joined: '2026-02-20' },
  { id: 'U-003', name: 'Agent Muthoni', email: 'muthoni.a@email.com', role: 'agent', county: 'Kiambu', status: 'active', joined: '2025-11-03' },
  { id: 'U-004', name: 'Equity Bank', email: 'loans@equity.co.ke', role: 'lender', county: 'Nairobi', status: 'active', joined: '2025-09-12' },
  { id: 'U-005', name: 'Sarah Wanjiku', email: 'sarah.w@email.com', role: 'buyer', county: 'Mombasa', status: 'active', joined: '2026-03-08' },
  { id: 'U-006', name: 'James Ochieng', email: 'james.o@email.com', role: 'farmer', county: 'Siaya', status: 'suspended', joined: '2026-02-14' },
  { id: 'U-007', name: 'KCB Group', email: 'agri@kcb.co.ke', role: 'lender', county: 'Nairobi', status: 'active', joined: '2025-08-01' },
  { id: 'U-008', name: 'Jane Akinyi', email: 'jane.a@email.com', role: 'farmer', county: 'Kisumu', status: 'pending', joined: '2026-06-18' },
  { id: 'U-009', name: 'Agent Kiprop', email: 'kiprop.a@email.com', role: 'agent', county: 'Bomet', status: 'active', joined: '2026-01-22' },
  { id: 'U-010', name: 'David Mwangi', email: 'david.m@email.com', role: 'farmer', county: 'Meru', status: 'active', joined: '2026-04-11' },
]

const ROLE_ICONS: Record<string, typeof Sprout> = { farmer: Sprout, agent: Shield, lender: Store, buyer: ShoppingCart, admin: ShieldCheck }
const ROLE_COLORS: Record<string, string> = { farmer: 'text-green-400 bg-green-400/10', agent: 'text-blue-400 bg-blue-400/10', lender: 'text-purple-400 bg-purple-400/10', buyer: 'text-orange-400 bg-orange-400/10', admin: 'text-red-400 bg-red-400/10' }

export default function AdminUsersPage() {
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')

  const filtered = USERS.filter(u => {
    if (roleFilter !== 'all' && u.role !== roleFilter) return false
    if (search) {
      const q = search.toLowerCase()
      return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.county.toLowerCase().includes(q)
    }
    return true
  })

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex items-center gap-2 text-xs text-text-muted mb-1">
        <Users className="w-3.5 h-3.5" />
        <span>Admin / User Management</span>
      </div>
      <h1 className="text-xl sm:text-2xl font-serif font-bold text-text-primary mb-1">User Management</h1>
      <p className="text-sm text-text-muted mb-6">View, filter, and manage all platform users</p>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, email, or county..."
            className="w-full bg-dark-mid border border-border-subtle rounded-xl py-2.5 pl-10 pr-4 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-green-primary/50"
          />
        </div>
        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}
          className="bg-dark-mid border border-border-subtle rounded-xl px-3 py-2.5 text-sm text-text-primary focus:outline-none focus:border-green-primary/50"
        >
          <option value="all">All Roles</option>
          <option value="farmer">Farmers</option>
          <option value="agent">Agents</option>
          <option value="lender">Lenders</option>
          <option value="buyer">Buyers</option>
          <option value="admin">Admins</option>
        </select>
      </div>

      <div className="bg-dark-mid border border-border-subtle rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-subtle">
                <th className="text-left py-3 px-4 text-xs font-medium text-text-muted uppercase">User</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-text-muted uppercase">Role</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-text-muted uppercase hidden sm:table-cell">County</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-text-muted uppercase hidden md:table-cell">Status</th>
                <th className="text-left py-3 px-4 text-xs font-medium text-text-muted uppercase hidden lg:table-cell">Joined</th>
                <th className="text-right py-3 px-4 text-xs font-medium text-text-muted uppercase">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id} className="border-b border-border-subtle last:border-0 hover:bg-dark-base/50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${ROLE_COLORS[u.role]}`}>
                        {(() => {
                          const Icon = ROLE_ICONS[u.role]
                          return Icon ? <Icon className="w-4 h-4" /> : null
                        })()}
                      </div>
                      <div>
                        <p className="text-text-primary font-medium">{u.name}</p>
                        <p className="text-text-muted text-[11px]">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${ROLE_COLORS[u.role]}`}>{u.role}</span>
                  </td>
                  <td className="py-3 px-4 text-text-muted text-xs hidden sm:table-cell">{u.county}</td>
                  <td className="py-3 px-4 hidden md:table-cell">
                    <span className={`flex items-center gap-1 text-xs ${
                      u.status === 'active' ? 'text-risk-low' : u.status === 'suspended' ? 'text-risk-high' : 'text-risk-medium'
                    }`}>
                      {u.status === 'active' ? <CheckCircle2 className="w-3 h-3" /> : <Ban className="w-3 h-3" />}
                      {u.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-text-muted text-xs hidden lg:table-cell">{u.joined}</td>
                  <td className="py-3 px-4 text-right">
                    <button className="text-green-primary hover:underline text-xs">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-text-muted text-sm">No users match your filters.</div>
        )}
      </div>
    </div>
  )
}
