'use client'

import { useState } from 'react'
import { X, Building2, Crown, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { toast } from 'sonner'

interface CreateOrganizationModalProps {
  isOpen: boolean
  onClose: () => void
  onCreate: (name: string, type: string) => void
}

export function CreateOrganizationModal({ isOpen, onClose, onCreate }: CreateOrganizationModalProps) {
  const [organizationName, setOrganizationName] = useState('')
  const [selectedType, setSelectedType] = useState('personal')
  const [isCreating, setIsCreating] = useState(false)

  const organizationTypes = [
    {
      id: 'personal',
      name: 'Personal Organization',
      description: 'For individual use and small projects',
      icon: Building2,
      color: 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400'
    },
    {
      id: 'team',
      name: 'Team Workspace',
      description: 'Collaborate with your team members',
      icon: Building2,
      color: 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      description: 'Advanced features for large teams',
      icon: Crown,
      color: 'bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400'
    }
  ]

  const handleSubmit = async () => {
    if (!organizationName.trim()) {
      toast.error('Please enter an organization name')
      return
    }

    setIsCreating(true)
    
    try {
      // Call the parent callback - let parent handle API call and success/error
      await onCreate(organizationName.trim(), selectedType)
      setOrganizationName('')
      // Don't close here - let parent decide when to close
    } catch (error) {
      console.error('Error creating organization:', error)
      toast.error('Network error. Please try again.')
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Organization</DialogTitle>
          <DialogDescription>
            Choose a name and type for your new organization workspace
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Organization Name Input */}
          <div className="space-y-2">
            <label htmlFor="org-name" className="text-sm font-medium">
              Organization Name
            </label>
            <Input
              id="org-name"
              placeholder="Enter organization name..."
              value={organizationName}
              onChange={(e) => setOrganizationName(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Organization Type Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Organization Type</label>
            <div className="grid gap-3">
              {organizationTypes.map((type) => (
                <div
                  key={type.id}
                  className={`
                    relative p-4 rounded-lg border-2 cursor-pointer transition-all
                    ${selectedType === type.id 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/50 hover:bg-muted'
                    }
                  `}
                  onClick={() => setSelectedType(type.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${type.color}`}>
                      <type.icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium mb-1">{type.name}</h3>
                      <p className="text-sm text-muted-foreground">{type.description}</p>
                    </div>
                    {selectedType === type.id && (
                      <div className="absolute top-2 right-2">
                        <div className="w-3 h-3 bg-primary rounded-full"></div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1" disabled={isCreating}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              className="flex-1"
              disabled={!organizationName.trim() || isCreating}
            >
              {isCreating ? 'Creating...' : 'Create Organization'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
