
import React, { useState, useEffect } from 'react';
import { supabase } from './services/supabase';
import { adrService } from './services/adrService';
import { ADR, ADRStatus } from './types';
import { Button, Badge, Input, Textarea, Card } from './components/UI';
import { Plus, Search, Filter, ArrowLeft, LogOut, FileText, ChevronRight, User as UserIcon, Edit2, Trash2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

// --- Views ---

const AuthView: React.FC<{ onAuth: () => void }> = ({ onAuth }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            data: {
              display_name: name,
            }
          }
        });
        if (error) throw error;
        alert('Check your email for confirmation!');
      }
      onAuth();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh]">
      <Card className="w-full max-w-md p-8 shadow-xl border-t-4 border-t-slate-900">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-slate-900 p-3 rounded-xl mb-4">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold">ADR Manager</h1>
          <p className="text-slate-500 text-sm mt-1">Documentation as it should be.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="text-sm font-medium mb-1 block">Full Name</label>
              <Input 
                type="text" 
                placeholder="John Doe" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                required
              />
            </div>
          )}
          <div>
            <label className="text-sm font-medium mb-1 block">Email</label>
            <Input 
              type="email" 
              placeholder="name@company.com" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Password</label>
            <Input 
              type="password" 
              placeholder="••••••••" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required
            />
          </div>
          {error && <p className="text-red-500 text-xs">{error}</p>}
          <Button className="w-full" isLoading={loading}>
            {isLogin ? 'Sign In' : 'Sign Up'}
          </Button>
        </form>
        
        <div className="mt-6 text-center">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-slate-600 hover:text-slate-900 underline"
          >
            {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
          </button>
        </div>
      </Card>
    </div>
  );
};

const Dashboard: React.FC<{ 
  onViewADR: (adr: ADR) => void; 
  onCreate: () => void;
}> = ({ onViewADR, onCreate }) => {
  const [adrs, setAdrs] = useState<ADR[]>([]);
  const [statusFilter, setStatusFilter] = useState<ADRStatus | 'all'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchADRs();
  }, [statusFilter]);

  const fetchADRs = async () => {
    setLoading(true);
    try {
      const data = await adrService.getADRs(statusFilter === 'all' ? undefined : statusFilter);
      setAdrs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Records</h1>
          <p className="text-slate-500">Track architecture decisions across your organization.</p>
        </div>
        <Button onClick={onCreate} className="w-full md:w-auto">
          <Plus className="w-4 h-4 mr-2" /> New ADR
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-4 rounded-lg border border-slate-200">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input className="pl-10" placeholder="Search titles..." />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select 
            className="flex h-10 w-full md:w-48 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
          >
            <option value="all">All Statuses</option>
            {Object.values(ADRStatus).map(status => (
              <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-40 bg-slate-100 animate-pulse rounded-lg border border-slate-200"></div>
          ))}
        </div>
      ) : adrs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <FileText className="w-16 h-16 text-slate-200 mb-4" />
          <h3 className="text-lg font-semibold">No records found</h3>
          <p className="text-slate-500 max-w-sm">
            Architecture decisions haven't been recorded yet or your filters are too restrictive.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {adrs.map(adr => (
            <Card key={adr.id} className="p-5 flex flex-col" onClick={() => onViewADR(adr)}>
              <div className="flex justify-between items-start mb-3">
                <Badge status={adr.status} />
                <span className="text-[10px] text-slate-400 uppercase font-mono">
                  #{adr.id.slice(0, 5)}
                </span>
              </div>
              <h3 className="text-lg font-bold line-clamp-2 flex-grow">{adr.title}</h3>
              <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-1">
                  <UserIcon className="w-3 h-3" />
                  <span className="truncate max-w-[120px]">{adr.author_email || 'Team Member'}</span>
                </div>
                <span>{new Date(adr.created_at).toLocaleDateString()}</span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

const ADRFormView: React.FC<{ 
  initialData?: ADR; 
  onBack: () => void; 
  onSuccess: (updatedAdr?: ADR) => void;
  title: string;
  submitLabel: string;
}> = ({ initialData, onBack, onSuccess, title, submitLabel }) => {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: initialData?.title || '',
    status: initialData?.status || ADRStatus.PROPOSED,
    context: initialData?.context || '',
    decision: initialData?.decision || '',
    consequences: initialData?.consequences || ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (initialData) {
        const updated = await adrService.updateADR(initialData.id, form);
        onSuccess(updated);
      } else {
        await adrService.createADR(form);
        onSuccess();
      }
    } catch (err) {
      console.error(err);
      alert('Error saving ADR');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <h1 className="text-2xl font-bold">{title}</h1>
      </div>

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-1">
              <label className="text-sm font-semibold mb-1 block">Title</label>
              <Input 
                placeholder="e.g. Use PostgreSQL for Main Database" 
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="text-sm font-semibold mb-1 block">Status</label>
              <select 
                className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                value={form.status}
                onChange={e => setForm({ ...form, status: e.target.value as ADRStatus })}
              >
                {Object.values(ADRStatus).map(s => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold mb-1 block">Context (Markdown)</label>
            <p className="text-xs text-slate-500 mb-2">The problem or issue that forced this decision.</p>
            <Textarea 
              placeholder="Describe the current situation..."
              value={form.context}
              onChange={e => setForm({ ...form, context: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="text-sm font-semibold mb-1 block">Decision (Markdown)</label>
            <p className="text-xs text-slate-500 mb-2">The chosen solution and why it was selected.</p>
            <Textarea 
              placeholder="We will use..."
              value={form.decision}
              onChange={e => setForm({ ...form, decision: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="text-sm font-semibold mb-1 block">Consequences (Optional)</label>
            <p className="text-xs text-slate-500 mb-2">Trade-offs, side effects, or future work.</p>
            <Textarea 
              placeholder="What changes after this decision?"
              value={form.consequences}
              onChange={e => setForm({ ...form, consequences: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onBack}>Cancel</Button>
            <Button type="submit" isLoading={loading}>{submitLabel}</Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

const ADRDetailView: React.FC<{ 
  adr: ADR; 
  onBack: () => void; 
  onEdit: () => void;
  onDelete: () => void;
  canEdit: boolean;
}> = ({ adr, onBack, onEdit, onDelete, canEdit }) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to permanently delete this record?')) {
      setIsDeleting(true);
      try {
        await adrService.deleteADR(adr.id);
        onDelete();
      } catch (err) {
        console.error(err);
        alert('Failed to delete ADR');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          {canEdit && (
            <>
              <Button variant="outline" size="sm" onClick={onEdit}>
                <Edit2 className="w-4 h-4 mr-2" /> Edit
              </Button>
              <Button variant="danger" size="sm" onClick={handleDelete} isLoading={isDeleting}>
                <Trash2 className="w-4 h-4 mr-2" /> Delete
              </Button>
            </>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span>Last updated {new Date(adr.updated_at).toLocaleDateString()}</span>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <Badge status={adr.status} />
          <span className="text-slate-400 font-mono text-sm uppercase">Record #{adr.id.slice(0, 8)}</span>
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">{adr.title}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-10">
          <section>
            <h2 className="text-xl font-bold border-b pb-2 mb-4">Context</h2>
            <div className="prose prose-slate max-w-none">
              <ReactMarkdown>{adr.context}</ReactMarkdown>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold border-b pb-2 mb-4">Decision</h2>
            <div className="prose prose-slate max-w-none">
              <ReactMarkdown>{adr.decision}</ReactMarkdown>
            </div>
          </section>

          {adr.consequences && (
            <section>
              <h2 className="text-xl font-bold border-b pb-2 mb-4">Consequences</h2>
              <div className="prose prose-slate max-w-none">
                <ReactMarkdown>{adr.consequences}</ReactMarkdown>
              </div>
            </section>
          )}
        </div>

        <div className="lg:col-span-1 space-y-6">
          <Card className="p-4 bg-slate-50/50">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Meta Information</h4>
            <div className="space-y-4">
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold">Author</p>
                <div className="flex items-center gap-2 mt-1">
                   <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center">
                     <UserIcon className="w-3 h-3 text-slate-500" />
                   </div>
                   <p className="text-sm font-medium truncate">{adr.author_email || 'Architect'}</p>
                </div>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-bold">Date Created</p>
                <p className="text-sm mt-1">{new Date(adr.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

// --- Main App Component ---

const App: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [view, setView] = useState<'dashboard' | 'create' | 'details' | 'edit'>('dashboard');
  const [selectedADR, setSelectedADR] = useState<ADR | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setInitializing(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const displayName = user?.user_metadata?.display_name || user?.email;

  if (initializing) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4">
        <AuthView onAuth={() => {}} />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Navigation Header */}
      <header className="sticky top-0 z-10 w-full border-b bg-white/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div 
            className="flex items-center gap-2 cursor-pointer" 
            onClick={() => { setView('dashboard'); setSelectedADR(null); }}
          >
            <div className="bg-slate-900 p-1.5 rounded-lg">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg hidden sm:inline-block">ADR Manager</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-xs font-medium text-slate-900">{displayName}</span>
              <span className="text-[10px] text-slate-500 uppercase tracking-widest">Architect</span>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout} title="Logout">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="container mx-auto px-4 py-8">
        {view === 'dashboard' && (
          <Dashboard 
            onViewADR={(adr) => { setSelectedADR(adr); setView('details'); }}
            onCreate={() => setView('create')}
          />
        )}

        {view === 'create' && (
          <ADRFormView 
            onBack={() => setView('dashboard')}
            onSuccess={() => setView('dashboard')}
            title="Record New Decision"
            submitLabel="Publish Decision"
          />
        )}

        {view === 'edit' && selectedADR && (
          <ADRFormView 
            initialData={selectedADR}
            onBack={() => setView('details')}
            onSuccess={(updated) => { 
              if (updated) setSelectedADR(updated);
              setView('details'); 
            }}
            title="Edit Architecture Decision"
            submitLabel="Update Decision"
          />
        )}

        {view === 'details' && selectedADR && (
          <ADRDetailView 
            adr={selectedADR}
            onBack={() => { setView('dashboard'); setSelectedADR(null); }}
            onEdit={() => setView('edit')}
            onDelete={() => { setView('dashboard'); setSelectedADR(null); }}
            canEdit={user.id === selectedADR.author_id}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t py-6 mt-12 bg-white">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row justify-between items-center text-slate-500 text-xs gap-4">
          <p>© {new Date().getFullYear()} Architecture Decision Records. Standardized & Versioned.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-slate-900">Documentation</a>
            <a href="#" className="hover:text-slate-900">Support</a>
            <a href="#" className="hover:text-slate-900">Privacy</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
