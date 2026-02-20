'use client'

import { useState } from 'react'
import { Search, Plus, Users, ArrowRight, Building2, Crown, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import ThemeToggle from '@/components/ui/theme-toggle'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import { CreateOrganizationModal } from '@/components/CreateOrganizationModal'
import { toast } from 'sonner'

export default function OrganizationPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleSearch = async (query: string) => {
    setIsLoading(true)
    // TODO: Implement organization search API call
    console.log('Searching for:', query)
    setTimeout(() => setIsLoading(false), 500)
  }

  const handleJoinOrganization = (orgId: string) => {
    // TODO: Implement join organization logic
    console.log('Joining organization:', orgId)
  }

  const handleCreateOrganization = () => {
    setIsModalOpen(true)
  }

  const handleCreateSubmit = async (name: string, type: string) => {
    try {
      setIsLoading(true)
      
      const response = await fetch('/api/organizations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          type,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Organization created:', result);
        setIsModalOpen(false)
        toast.success(`Organization "${name}" created successfully!`)
        
        // Refresh organizations list and redirect to dashboard
        setTimeout(() => {
          window.location.href = '/dashboard'
        }, 1000)
      } else {
        const error = await response.json()
        console.error('Failed to create organization:', error)
        toast.error(error.error || 'Failed to create organization')
      }
    } catch (error) {
      console.error('Error creating organization:', error)
      toast.error('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-auto h-10 relative flex items-center justify-center">
              <img src="/tru-light.webp" alt="Logo" className="block dark:hidden object-contain h-8" />
              <img src="/tru-dark.webp" alt="Logo dark" className="hidden dark:block object-contain h-8" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/dashboard">
              <Button size="sm" variant="ghost">Dashboard</Button>
            </Link>
            <UserButton afterSignOutUrl="/" />
          </div>
        </nav>
      </header>

      <div className="max-w-4xl mx-auto py-12 px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-between items-center mb-6">
            <div></div>
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                Skip for now
              </Button>
            </Link>
          </div>
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-primary/10 rounded-full">
              <Users className="h-12 w-12 text-primary" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-4">
            Join or create a new organization
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Collaborate with your team and manage monitors together in a shared workspace
          </p>
        </div>

        {/* Search Section */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search organizations by name or ID..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  if (e.target.value.length > 2) {
                    handleSearch(e.target.value)
                  }
                }}
                className="pl-10 pr-10"
              />
              {isLoading && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Search Results */}
        {searchQuery.length > 2 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Search Results</CardTitle>
            </CardHeader>
            <CardContent>
              {/* TODO: Replace with actual search results */}
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No organizations found matching "{searchQuery}"</p>
                <p className="text-sm mt-2">Try a different search term or create a new organization</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Create Organization Section */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Create New Organization</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">Start a new workspace for your team</p>
              </div>
              <Button onClick={handleCreateOrganization} className="gap-2">
                <Plus className="h-4 w-4" />
                Create Organization
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <Card className="cursor-pointer transition-all hover:shadow-md hover:border-primary/50">
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center mb-3">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                      <Building2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                  <h3 className="font-semibold mb-2">Team Workspace</h3>
                  <p className="text-sm text-muted-foreground">Collaborate with your team members</p>
                </CardContent>
              </Card>

              <Card className="cursor-pointer transition-all hover:shadow-md hover:border-primary/50">
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center mb-3">
                    <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                      <Plus className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                  <h3 className="font-semibold mb-2">Personal Organization</h3>
                  <p className="text-sm text-muted-foreground">For individual use and small projects</p>
                </CardContent>
              </Card>

              <Card className="cursor-pointer transition-all hover:shadow-md hover:border-primary/50 border-primary/20">
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center mb-3">
                    <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                      <Crown className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                  </div>
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <h3 className="font-semibold">Enterprise</h3>
                    <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <p className="text-sm text-muted-foreground">Advanced features for large teams</p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Popular Organizations */}
        <div className="mt-12">
          <h2 className="text-2xl font-semibold mb-6 text-center">Popular Organizations</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* TODO: Replace with actual popular organizations */}
            {[
              { name: 'TechCorp Inc', members: 150, monitors: 1200, tier: 'pro', type: 'enterprise' },
              { name: 'DevTeam Pro', members: 45, monitors: 320, tier: 'team', type: 'team' },
              { name: 'StartupHub', members: 28, monitors: 180, tier: 'personal', type: 'personal' }
            ].map((org, index) => (
              <Card key={index} className="transition-all hover:shadow-md cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-muted rounded-full">
                      <Users className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div className="text-right">
                      <span className="text-sm text-muted-foreground">{org.members} members</span>
                      <div className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary capitalize">
                        {org.type}
                      </div>
                    </div>
                  </div>
                  <h3 className="font-semibold mb-2">{org.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{org.monitors} active monitors</p>
                  <Button
                    onClick={() => handleJoinOrganization(org.name)}
                    variant="outline"
                    className="w-full"
                  >
                    Request to Join
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Continue to Dashboard */}
        <div className="mt-12 text-center border-t pt-8">
          <p className="text-muted-foreground mb-4">Want to set up organization later?</p>
          <Link href="/dashboard">
            <Button variant="ghost" className="gap-2">
              Continue to Dashboard
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Create Organization Modal */}
      <CreateOrganizationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreateSubmit}
      />
    </div>
  )
}
