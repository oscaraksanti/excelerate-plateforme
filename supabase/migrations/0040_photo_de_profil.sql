-- ═══════════════════════════════════════════════════════════════════
--  Une photo
--
--  Le fil de discussion affiche des initiales dans un carré gris, et
--  l'en-tête un prénom. Une plateforme d'apprentissage où personne n'a
--  de visage se lit comme un formulaire administratif.
--
--  La photo ne va pas sur le certificat : celui-ci est un document,
--  pas un profil, et il doit rester sobre et vérifiable.
-- ═══════════════════════════════════════════════════════════════════

alter table public.profils
  add column if not exists avatar text;

comment on column public.profils.avatar is
  'Chemin dans le seau « avatars ». Vide : on retombe sur les initiales.';

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 2097152,
        array['image/jpeg','image/png','image/webp'])
on conflict (id) do update
  set public = true,
      file_size_limit = 2097152,
      allowed_mime_types = array['image/jpeg','image/png','image/webp'];

--  Chacun écrit dans son propre dossier, dont le nom est son
--  identifiant : personne ne peut remplacer la photo d'un autre.
drop policy if exists "avatars : je dépose la mienne" on storage.objects;
create policy "avatars : je dépose la mienne" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "avatars : je remplace la mienne" on storage.objects;
create policy "avatars : je remplace la mienne" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "avatars : je supprime la mienne" on storage.objects;
create policy "avatars : je supprime la mienne" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

--  Le seau est public en lecture : une photo de profil s'affiche dans
--  le fil, et signer chaque vignette coûterait une requête par message.
drop policy if exists "avatars : tout le monde regarde" on storage.objects;
create policy "avatars : tout le monde regarde" on storage.objects
  for select to public
  using (bucket_id = 'avatars');
