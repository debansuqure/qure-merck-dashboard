-- ============================================================
-- 002_seed.sql  –  Seed data for Qure–Merck Dashboard
-- ============================================================

-- ── Programmes ───────────────────────────────────────────────
insert into programmes (id, name, slug) values
  ('00000000-0000-0000-0000-000000000001', 'qXR',    'qxr'),
  ('00000000-0000-0000-0000-000000000002', 'qTrack', 'qtrack'),
  ('00000000-0000-0000-0000-000000000003', 'PAH',    'pah');

-- ── qXR Sites ────────────────────────────────────────────────
-- US: 6 sites (5 live, 1 blocked/delayed)
insert into sites (id, programme_id, identifier, name, country, status) values
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'qXR-US-1', 'qXR US Site 1', 'United States', 'live'),
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'qXR-US-2', 'qXR US Site 2', 'United States', 'live'),
  ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'qXR-US-3', 'qXR US Site 3', 'United States', 'live'),
  ('10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'qXR-US-4', 'qXR US Site 4', 'United States', 'live'),
  ('10000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000001', 'qXR-US-5', 'qXR US Site 5', 'United States', 'live'),
  ('10000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000001', 'qXR-US-6', 'qXR US Site 6', 'United States', 'blocked');

-- NL: 4 sites (all live)
insert into sites (id, programme_id, identifier, name, country, status, notes) values
  ('10000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000001', 'qXR-NL-1', 'qXR NL Site 1', 'Netherlands', 'live', 'Phase 1 recording complete. Tracking nodule progression to lung cancer.'),
  ('10000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000001', 'qXR-NL-2', 'qXR NL Site 2', 'Netherlands', 'live', 'Phase 1 recording complete. Tracking nodule progression to lung cancer.'),
  ('10000000-0000-0000-0000-000000000009', '00000000-0000-0000-0000-000000000001', 'qXR-NL-3', 'qXR NL Site 3', 'Netherlands', 'live', 'Phase 1 recording complete. Tracking nodule progression to lung cancer.'),
  ('10000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000001', 'qXR-NL-4', 'qXR NL Site 4', 'Netherlands', 'live', 'Phase 1 recording complete. Tracking nodule progression to lung cancer.');

-- ── qXR Milestones – US (milestones: Contract, IRB/Ethics, Site Setup, Go Live, Recording, Downstream Tracking)
-- Sites 1–5: all complete; Site 6: blocked at Site Setup
do $$
declare
  site_ids uuid[] := array[
    '10000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000002',
    '10000000-0000-0000-0000-000000000003',
    '10000000-0000-0000-0000-000000000004',
    '10000000-0000-0000-0000-000000000005'
  ];
  ms text[] := array['Contract','IRB / Ethics','Site Setup','Go Live','Recording','Downstream Tracking'];
  sid uuid;
  i int;
begin
  foreach sid in array site_ids loop
    for i in 1..array_length(ms, 1) loop
      insert into milestones (site_id, name, status, sort_order)
      values (sid, ms[i], 'complete', i);
    end loop;
  end loop;
end$$;

-- Site 6 (delayed): Contract + IRB complete, Site Setup blocked
insert into milestones (site_id, name, status, sort_order) values
  ('10000000-0000-0000-0000-000000000006', 'Contract',            'complete',    1),
  ('10000000-0000-0000-0000-000000000006', 'IRB / Ethics',        'complete',    2),
  ('10000000-0000-0000-0000-000000000006', 'Site Setup',          'blocked',     3),
  ('10000000-0000-0000-0000-000000000006', 'Go Live',             'pending',     4),
  ('10000000-0000-0000-0000-000000000006', 'Recording',           'pending',     5),
  ('10000000-0000-0000-0000-000000000006', 'Downstream Tracking', 'pending',     6);

-- ── qXR Milestones – NL (Phase 1 Recording complete, Downstream Tracking in progress)
do $$
declare
  site_ids uuid[] := array[
    '10000000-0000-0000-0000-000000000007',
    '10000000-0000-0000-0000-000000000008',
    '10000000-0000-0000-0000-000000000009',
    '10000000-0000-0000-0000-000000000010'
  ];
  sid uuid;
begin
  foreach sid in array site_ids loop
    insert into milestones (site_id, name, status, sort_order) values
      (sid, 'Contract',             'complete',    1),
      (sid, 'IRB / Ethics',         'complete',    2),
      (sid, 'Site Setup',           'complete',    3),
      (sid, 'Go Live',              'complete',    4),
      (sid, 'Phase 1 Recording',    'complete',    5),
      (sid, 'Downstream Tracking',  'in_progress', 6);
  end loop;
end$$;

-- ── qTrack Sites ─────────────────────────────────────────────
-- US: 4 live
insert into sites (id, programme_id, identifier, name, country, status) values
  ('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'qTrack-US-1', 'qTrack US Site 1', 'United States', 'live'),
  ('20000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', 'qTrack-US-2', 'qTrack US Site 2', 'United States', 'live'),
  ('20000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000002', 'qTrack-US-3', 'qTrack US Site 3', 'United States', 'live'),
  ('20000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000002', 'qTrack-US-4', 'qTrack US Site 4', 'United States', 'live');

-- EU: 2 pending
insert into sites (id, programme_id, identifier, name, country, status) values
  ('20000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000002', 'qTrack-EU-1', 'qTrack EU Site 1', 'Europe', 'pending'),
  ('20000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000002', 'qTrack-EU-2', 'qTrack EU Site 2', 'Europe', 'pending');

-- qTrack Milestones – US (all complete)
do $$
declare
  site_ids uuid[] := array[
    '20000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0000-000000000002',
    '20000000-0000-0000-0000-000000000003',
    '20000000-0000-0000-0000-000000000004'
  ];
  ms text[] := array['Contract','IRB','Site Setup','Training','Integration','Go Live','Validation','Monitoring'];
  sid uuid;
  i int;
begin
  foreach sid in array site_ids loop
    for i in 1..array_length(ms, 1) loop
      insert into milestones (site_id, name, status, sort_order)
      values (sid, ms[i], 'complete', i);
    end loop;
  end loop;
end$$;

-- qTrack Milestones – EU (all pending)
do $$
declare
  site_ids uuid[] := array[
    '20000000-0000-0000-0000-000000000005',
    '20000000-0000-0000-0000-000000000006'
  ];
  ms text[] := array['Contract','IRB','Site Setup','Training','Integration','Go Live','Validation','Monitoring'];
  sid uuid;
  i int;
begin
  foreach sid in array site_ids loop
    for i in 1..array_length(ms, 1) loop
      insert into milestones (site_id, name, status, sort_order)
      values (sid, ms[i], 'pending', i);
    end loop;
  end loop;
end$$;

-- ── PAH Sites ────────────────────────────────────────────────
-- 4 US + 4 EU, all pending
insert into sites (id, programme_id, identifier, name, country, status) values
  ('30000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003', 'PAH-US-1', 'PAH US Site 1', 'United States', 'pending'),
  ('30000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003', 'PAH-US-2', 'PAH US Site 2', 'United States', 'pending'),
  ('30000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000003', 'PAH-US-3', 'PAH US Site 3', 'United States', 'pending'),
  ('30000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000003', 'PAH-US-4', 'PAH US Site 4', 'United States', 'pending'),
  ('30000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000003', 'PAH-EU-1', 'PAH EU Site 1', 'Europe',         'pending'),
  ('30000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000003', 'PAH-EU-2', 'PAH EU Site 2', 'Europe',         'pending'),
  ('30000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000003', 'PAH-EU-3', 'PAH EU Site 3', 'Europe',         'pending'),
  ('30000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000003', 'PAH-EU-4', 'PAH EU Site 4', 'Europe',         'pending');

-- PAH Milestones (all pending)
do $$
declare
  site_ids uuid[] := array[
    '30000000-0000-0000-0000-000000000001',
    '30000000-0000-0000-0000-000000000002',
    '30000000-0000-0000-0000-000000000003',
    '30000000-0000-0000-0000-000000000004',
    '30000000-0000-0000-0000-000000000005',
    '30000000-0000-0000-0000-000000000006',
    '30000000-0000-0000-0000-000000000007',
    '30000000-0000-0000-0000-000000000008'
  ];
  ms text[] := array[
    'Initial Discussion','Stakeholder Alignment','Contracting',
    'Legal Review','Ethics','Budget Approval','Site Setup','Go Live'
  ];
  sid uuid;
  i int;
begin
  foreach sid in array site_ids loop
    for i in 1..array_length(ms, 1) loop
      insert into milestones (site_id, name, status, sort_order)
      values (sid, ms[i], 'pending', i);
    end loop;
  end loop;
end$$;
