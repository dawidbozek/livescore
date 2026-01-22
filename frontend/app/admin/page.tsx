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
  Target,
  Disc,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTournaments } from '@/hooks/useTournaments';
import type { Tournament, TournamentFormData, DartType, TournamentCategory } from '@/lib/types';
import { toDateString, cn } from '@/lib/utils';

const defaultFormData: TournamentFormData = {
  name: '',
  n01_url: '',
  tournament_date: toDateString(new Date()),
  is_active: true,
  dart_type: 'steel',
  category: null,
  start_time: null,
  entry_fee: null,
  prizes: null,
  format: null,
  image_url: null,
};

const categoryOptions: { value: TournamentCategory | ''; label: string }[] = [
  { value: '', label: 'Nie określono' },
  { value: 'indywidualny', label: 'Turniej indywidualny' },
  { value: 'deblowy', label: 'Turniej deblowy' },
  { value: 'triple_mieszane', label: 'Triple mieszane' },
  { value: 'druzynowy', label: 'Turniej drużynowy' },
];

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTournament, setEditingTournament] = useState<Tournament | null>(null);
  const [formData, setFormData] = useState<TournamentFormData>(defaultFormData);
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
      ...defaultFormData,
      tournament_date: selectedDate ? toDateString(selectedDate) : toDateString(new Date()),
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
      dart_type: tournament.dart_type,
      category: tournament.category,
      start_time: tournament.start_time,
      entry_fee: tournament.entry_fee,
      prizes: tournament.prizes,
      format: tournament.format,
      image_url: tournament.image_url,
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
                  className="pr-10 min-h-[44px]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
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

              <Button type="submit" className="w-full min-h-[44px]" disabled={isAuthLoading}>
                {isAuthLoading ? 'Logowanie...' : 'Zaloguj'}
              </Button>

              <Link href="/" className="block">
                <Button variant="ghost" className="w-full min-h-[44px]">
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
    <div className="min-h-screen min-w-[320px]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background border-b">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-4">
              <Link href="/">
                <Button variant="ghost" size="icon" className="min-h-[44px] min-w-[44px]">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              <h1 className="text-lg sm:text-xl font-bold">Panel Admina</h1>
            </div>

            <Button variant="outline" size="sm" onClick={handleLogout} className="min-h-[44px]">
              Wyloguj
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {/* Date selector and Add button */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-end gap-2">
            <div>
              <label className="block text-sm font-medium mb-1">
                Filtruj po dacie
              </label>
              <div className="flex gap-2">
                <Button
                  variant={selectedDate === null ? 'default' : 'outline'}
                  onClick={() => setSelectedDate(null)}
                  className="min-h-[44px]"
                >
                  Wszystkie
                </Button>
                <Input
                  type="date"
                  value={selectedDate ? toDateString(selectedDate) : ''}
                  onChange={(e) => e.target.value ? setSelectedDate(new Date(e.target.value + 'T00:00:00')) : setSelectedDate(null)}
                  className="w-auto min-h-[44px]"
                />
              </div>
            </div>
          </div>

          <Button onClick={openAddForm} className="min-h-[44px]">
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
                <CardContent className="p-3 sm:p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold truncate">
                          {tournament.name}
                        </h3>
                        {tournament.is_active ? (
                          <span className="px-2 py-0.5 bg-darts-green/10 text-darts-green text-xs rounded-full">
                            Aktywny
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-gray-500/10 text-gray-600 text-xs rounded-full">
                            Nieaktywny
                          </span>
                        )}
                        <span className={cn(
                          'px-2 py-0.5 text-xs rounded-full flex items-center gap-1',
                          tournament.dart_type === 'soft'
                            ? 'bg-darts-soft/10 text-darts-soft'
                            : 'bg-darts-steel/10 text-darts-steel'
                        )}>
                          {tournament.dart_type === 'soft' ? (
                            <Disc className="w-3 h-3" />
                          ) : (
                            <Target className="w-3 h-3" />
                          )}
                          {tournament.dart_type === 'soft' ? 'Soft' : 'Steel'}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate mt-1">
                        {tournament.n01_url}
                      </p>
                      {tournament.start_time && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Start: {tournament.start_time}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-1 sm:gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleToggleActive(tournament)}
                        title={tournament.is_active ? 'Dezaktywuj' : 'Aktywuj'}
                        className="min-h-[44px] min-w-[44px]"
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
                        className="min-h-[44px] min-w-[44px]"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(tournament)}
                        title="Usuń"
                        className="text-destructive hover:text-destructive min-h-[44px] min-w-[44px]"
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
          <div
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-3 sm:p-4"
            onClick={closeForm}
          >
            <Card
              className="w-full max-w-lg max-h-[90vh] overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <CardHeader>
                <CardTitle>
                  {editingTournament ? 'Edytuj turniej' : 'Dodaj turniej'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Podstawowe pola */}
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Nazwa turnieju *
                    </label>
                    <Input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="np. MP Seniorów 2026"
                      required
                      className="min-h-[44px]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      URL z n01darts.com *
                    </label>
                    <Input
                      type="url"
                      value={formData.n01_url}
                      onChange={(e) =>
                        setFormData({ ...formData, n01_url: e.target.value })
                      }
                      placeholder="https://n01darts.com/online/..."
                      required
                      className="min-h-[44px]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Data turnieju *
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
                        className="min-h-[44px]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Godzina startu
                      </label>
                      <Input
                        type="time"
                        value={formData.start_time || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            start_time: e.target.value || null,
                          })
                        }
                        className="min-h-[44px]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Typ darta
                      </label>
                      <select
                        value={formData.dart_type}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            dart_type: e.target.value as DartType,
                          })
                        }
                        className="w-full min-h-[44px] px-3 py-2 bg-background border rounded-md"
                      >
                        <option value="steel">Steel Tip</option>
                        <option value="soft">Soft Tip</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Kategoria
                      </label>
                      <select
                        value={formData.category || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            category: (e.target.value as TournamentCategory) || null,
                          })
                        }
                        className="w-full min-h-[44px] px-3 py-2 bg-background border rounded-md"
                      >
                        {categoryOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Wpisowe
                      </label>
                      <Input
                        type="text"
                        value={formData.entry_fee || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            entry_fee: e.target.value || null,
                          })
                        }
                        placeholder="np. 50 PLN"
                        className="min-h-[44px]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Format
                      </label>
                      <Input
                        type="text"
                        value={formData.format || ''}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            format: e.target.value || null,
                          })
                        }
                        placeholder="np. Best of 5"
                        className="min-h-[44px]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Nagrody
                    </label>
                    <textarea
                      value={formData.prizes || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          prizes: e.target.value || null,
                        })
                      }
                      placeholder="np. 1. miejsce: 500 PLN&#10;2. miejsce: 300 PLN"
                      rows={3}
                      className="w-full px-3 py-2 bg-background border rounded-md resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      URL grafiki
                    </label>
                    <Input
                      type="url"
                      value={formData.image_url || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          image_url: e.target.value || null,
                        })
                      }
                      placeholder="https://..."
                      className="min-h-[44px]"
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
                      className="w-5 h-5"
                    />
                    <label htmlFor="is_active" className="text-sm">
                      Turniej aktywny
                    </label>
                  </div>

                  {formError && (
                    <p className="text-sm text-destructive">{formError}</p>
                  )}

                  <div className="flex gap-2 justify-end pt-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={closeForm}
                      disabled={isSubmitting}
                      className="min-h-[44px]"
                    >
                      Anuluj
                    </Button>
                    <Button type="submit" disabled={isSubmitting} className="min-h-[44px]">
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
