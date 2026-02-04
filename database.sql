
-- 1. Criar o Enum de Status do ADR
CREATE TYPE adr_status AS ENUM ('proposed', 'accepted', 'rejected', 'deprecated', 'superseded');

-- 2. Criar a tabela de Perfis (para exibir nomes dos autores)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Habilitar RLS nos perfis
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Perfis são públicos" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "Usuários podem atualizar o próprio perfil" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- 3. Função e Trigger para criar perfil automaticamente no Signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'display_name', new.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 4. Criar a tabela de ADRs
CREATE TABLE adrs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  status adr_status NOT NULL DEFAULT 'proposed',
  context TEXT NOT NULL,
  decision TEXT NOT NULL,
  consequences TEXT,
  author_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Habilitar RLS nos ADRs
ALTER TABLE adrs ENABLE ROW LEVEL SECURITY;

-- Política: Qualquer um pode ler ADRs (Público)
CREATE POLICY "Leitura pública de ADRs" ON adrs
  FOR SELECT USING (true);

-- Política: Apenas usuários autenticados podem criar ADRs
CREATE POLICY "Usuários autenticados criam ADRs" ON adrs
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Política: Apenas o autor pode atualizar seu ADR
CREATE POLICY "Autores editam seus próprios ADRs" ON adrs
  FOR UPDATE USING (auth.uid() = author_id);

-- Política: Apenas o autor pode deletar seu ADR
CREATE POLICY "Autores deletam seus próprios ADRs" ON adrs
  FOR DELETE USING (auth.uid() = author_id);

-- 6. Trigger para atualizar o campo updated_at automaticamente
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_adrs_modtime
  BEFORE UPDATE ON adrs
  FOR EACH ROW
  EXECUTE PROCEDURE handle_updated_at();
