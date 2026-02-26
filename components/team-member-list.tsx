"use client"

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function TeamMemberList() {
  const { users, updateUserRole, removeUser } = useAuth()
  const [teamMembers, setTeamMembers] = useState(users)

  useEffect(() => {
    setTeamMembers(users)
  }, [users])

  const handleRoleChange = async (userId: string, newRole: 'admin' | 'member') => {
    await updateUserRole(userId, newRole)
    setTeamMembers(teamMembers.map(member => 
      member.id === userId ? { ...member, role: newRole } : member
    ))
  }

  const handleRemoveUser = async (userId: string) => {
    if (window.confirm("Are you sure you want to remove this user from the team?")) {
      await removeUser(userId)
      setTeamMembers(teamMembers.filter(member => member.id !== userId))
    }
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {teamMembers.map((member) => (
          <TableRow key={member.id}>
            <TableCell>{member.fullName}</TableCell>
            <TableCell>{member.email}</TableCell>
            <TableCell>
              <Select
                value={member.role}
                onValueChange={(value) => handleRoleChange(member.id, value as 'admin' | 'member')}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </TableCell>
            <TableCell>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleRemoveUser(member.id)}
              >
                Remove
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
