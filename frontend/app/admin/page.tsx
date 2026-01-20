'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Edit,
  Power,
  PowerOff,
  Lock,
  Eye,
  EyeOff,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTournaments } from '@/hooks/useTournaments';
import type { Tournament, TournamentFormData } from '@/lib/types';
import { toDateString, cn } from '@/lib/utils';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTournament, setEditingTournament] = useState<Tournament | null>(null);
  const [formData, setFormData] = useState<TournamentFormData>({
    name: '',
    n01_url: '',
    tournament_date: toDateString(new Date()),
    is_active: true,
  });
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { tournaments, isLoading, refetch } = useTournaments({
    date: selectedDate,
    includeInactive: true,
  });

  // Sprawdź sesję
  useEffect(() => {
    const authStatus = sessionStorage.getItem('admin_authenticated');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthLoading(true);
    setAuthError('');

    try {
      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (data.success) {
        setIsAuthenticated(true);
        sessionStorage.setItem('admin_authenticated', 'true');
      } else {
        setAuthError(data.message || 'Nieprawidłowe hasło');
      }
    } catch {
      setAuthError('Błąd połączenia z serwerem');
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('admin_authenticated');
    setPassword('');
  };

  const openAddForm = () => {
    setEditingTournament(null);
    setFormData({
      name: '',
      n01_url: '',
      tournament_date: toDateString(selectedDate),
      is_active: true,
    });
    setFormError('');
    setIsFormOpen(true);
  };

  const openEditForm = (tournament: Tournament) => {
    setEditingTournament(tournament);
    setFormData({
      name: tournament.name,
      n01_url: tournament.n01_url,
      tournament_date: tournament.tournament_date,
      is_active: tournament.is_active,
    });
    setFormError('');
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingTournament(null);
    setFormError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError('');

    try {
      const endpoint = '/api/admin/tournaments';
      const method = editingTournament ? 'PUT' : 'POST';
      const body = editingTournament
        ? { id: editingTournament.id, ...formData }
        : formData;

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Wystąpił błąd');
      }

      closeForm();
      refetch();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Wystąpił błąd');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (tournament: Tournament) => {
    try {
      const response = await fetch('/api/admin/tournaments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: tournament.id,
          is_active: !tournament.is_active,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update tournament');
      }

      refetch();
    } catch (err) {
      console.error('Error toggling tournament:', err);
    }
  };

  const handleDelete = async (tournament: Tournament) => {
    if (!confirm(`Czy na pewno chcesz usunąć turniej "${tournament.name}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/tournaments?id=${tournament.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete tournament');
      }

      refetch();
    } catch (err) {
      console.error('Error deleting tournament:', err);
    }
  };

  // Ekran logowania
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Lock className="w-6 h-6 text-primary" />
            </div>
            <CardTitle>Panel Administracyjny</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAuth} className="space-y-4">
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Hasło"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>

              {authError && (
                <p className="text-sm text-destructive">{authError}</p>
              )}

              <Button type="submit" className="w-full" disabled={isAuthLoading}>
                {isAuthLoading ? 'Logowanie...' : 'Zaloguj'}
              </Button>

              <Link href="/" className="block">
                <Button variant="ghost" className="w-full">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Powrót do strony głównej
                </Button>
              </Link>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              <h1 className="text-xl font-bold">Panel Administracyjny</h1>
            </div>

            <Button variant="outline" size="sm" onClick={handleLogout}>
              Wyloguj
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Date selector and Add button */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-1">
              Wybierz datę turnieju
            </label>
            <Input
              type="date"
              value={toDateString(selectedDate)}
              onChange={(e) => setSelectedDate(new Date(e.target.value + 'T00:00:00'))}
              className="w-auto"
            />
          </div>

          <Button onClick={openAddForm}>
            <Plus className="w-4 h-4 mr-2" />
            Dodaj turniej
          </Button>
        </div>

        {/* Tournament list */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-24 rounded-lg" />
            ))}
          </div>
        ) : tournaments.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <p>Brak turniejów na wybrany dzień</p>
              <Button variant="link" onClick={openAddForm}>
                Dodaj pierwszy turniej
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {tournaments.map((tournament) => (
              <Card
                key={tournament.id}
                className={cn(!tournament.is_active && 'opacity-60')}
              >
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold truncate">
                          {tournament.name}
                        </h3>
                        {tournament.is_active ? (
                          <span className="px-2 py-0.5 bg-green-500/10 text-green-700 text-xs rounded-full">
                            Aktywny
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-gray-500/10 text-gray-600 text-xs rounded-full">
                            Nieaktywny
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate mt-1">
                        {tournament.n01_url}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleToggleActive(tournament)}
                        title={tournament.is_active ? 'Dezaktywuj' : 'Aktywuj'}
                      >
                        {tournament.is_active ? (
                          <PowerOff className="w-4 h-4" />
                        ) : (
                          <Power className="w-4 h-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditForm(tournament)}
                        title="Edytuj"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(tournament)}
                        title="Usuń"
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Form modal */}
        {isFormOpen && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <Card className="w-full max-w-lg">
              <CardHeader>
                <CardTitle>
                  {editingTournament ? 'Edytuj turniej' : 'Dodaj turniej'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Nazwa turnieju
                    </label>
                    <Input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="np. MP Seniorów 2026"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      URL z n01darts.com
                    </label>
                    <Input
                      type="url"
                      value={formData.n01_url}
                      onChange={(e) =>
                        setFormData({ ...formData, n01_url: e.target.value })
                      }
                      placeholder="https://n01darts.com/online/..."
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Data turnieju
                    </label>
                    <Input
                      type="date"
                      value={formData.tournament_date}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          tournament_date: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="is_active"
                      checked={formData.is_active}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          is_active: e.target.checked,
                        })
                      }
                      className="w-4 h-4"
                    />
                    <label htmlFor="is_active" className="text-sm">
                      Turniej aktywny
                    </label>
                  </div>

                  {formError && (
                    <p className="text-sm text-destructive">{formError}</p>
                  )}

                  <div className="flex gap-2 justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={closeForm}
                      disabled={isSubmitting}
                    >
                      Anuluj
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting
                        ? 'Zapisywanie...'
                        : editingTournament
                        ? 'Zapisz'
                        : 'Dodaj'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
