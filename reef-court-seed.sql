-- Reef Courts Estate streets and house numbers, transcribed from the estate
-- site map photos (136701/136704/136707/136710.jpg) on 2026-10-29.
-- Source of truth: reef-court-addresses.csv. Rows marked low confidence are
-- commented out; confirm them with the estate office, then uncomment.
-- Run after reef-court-schema.sql. Safe to re-run.

insert into estate_streets (street_name) values
  ('Primrose Crescent'),
  ('Mayflower Close'),
  ('Hazelgrove Close'),
  ('Ivy Close'),
  ('Ashoka Close'),
  ('Alabisa Close'),
  ('Acacia Close'),
  ('Maple Close'),
  ('Nettle Close')
on conflict (street_name) do nothing;

insert into reef_court_addresses (street_id, house_number)
select s.id, v.house_number
from (values
  ('Primrose Crescent', '1'),
  ('Primrose Crescent', '2'),
  ('Primrose Crescent', '3'),
  ('Primrose Crescent', '4'),
  ('Primrose Crescent', '5'),
  ('Primrose Crescent', '6'),
  ('Primrose Crescent', '7'),
  ('Primrose Crescent', '8'),
  ('Primrose Crescent', '9'),
  ('Primrose Crescent', '10'),
  ('Primrose Crescent', '11'),
  ('Primrose Crescent', '12'),
  ('Primrose Crescent', '14'),
  ('Primrose Crescent', '16'),
  ('Primrose Crescent', '13'),
  ('Primrose Crescent', '15'),
  ('Primrose Crescent', '17'),
  ('Primrose Crescent', '19'),
  ('Primrose Crescent', '21'),
  ('Primrose Crescent', '23'),
  ('Primrose Crescent', '25'),
  ('Primrose Crescent', '27'),
  ('Primrose Crescent', '18'),
  ('Primrose Crescent', '20'),
  ('Primrose Crescent', '22'),
  ('Primrose Crescent', '24'),
  ('Primrose Crescent', '26'),
  ('Primrose Crescent', '28'),
  ('Mayflower Close', '1'),
  ('Mayflower Close', '3'),
  ('Mayflower Close', '5'),
  ('Mayflower Close', '7'),
  ('Mayflower Close', '9'),
  ('Mayflower Close', '11'),
  ('Mayflower Close', '4'),
  ('Mayflower Close', '6'),
  ('Mayflower Close', '8'),
  ('Mayflower Close', '10'),
  ('Mayflower Close', '12'),
  ('Hazelgrove Close', '1'),
  ('Hazelgrove Close', '2'),
  ('Hazelgrove Close', '3'),
  ('Hazelgrove Close', '4'),
  ('Hazelgrove Close', '5'),
  ('Hazelgrove Close', '6'),
  ('Hazelgrove Close', '7'),
  ('Ivy Close', '1'),
  ('Ivy Close', '3'),
  ('Ivy Close', '5'),
  ('Ivy Close', '7'),
  ('Ivy Close', '9'),
  ('Ivy Close', '2'),
  ('Ivy Close', '4'),
  ('Ivy Close', '6'),
  ('Ivy Close', '8'),
  ('Ashoka Close', '1'),
  ('Ashoka Close', '2'),
  ('Ashoka Close', '3'),
  ('Ashoka Close', '4'),
  ('Alabisa Close', '1'),
  ('Alabisa Close', '2'),
  ('Alabisa Close', '3'),
  ('Alabisa Close', '4'),
  ('Alabisa Close', '5'),
  ('Alabisa Close', '6'),
  ('Acacia Close', '1'),
  ('Acacia Close', '3'),
  ('Acacia Close', '5'),
  ('Maple Close', '1'),
  ('Maple Close', '2'),
  ('Maple Close', '3'),
  ('Nettle Close', '2'),
  ('Nettle Close', '4'),
  ('Nettle Close', '6'),
  ('Nettle Close', '8'),
  ('Nettle Close', '10'),
  ('Nettle Close', '12'),
  ('Nettle Close', '14'),
  ('Nettle Close', '16'),
  ('Nettle Close', '18'),
  ('Nettle Close', '20'),
  ('Nettle Close', '1'),
  ('Nettle Close', '3'),
  ('Nettle Close', '5'),
  ('Nettle Close', '7'),
  ('Nettle Close', '9'),
  ('Nettle Close', '11')
) as v(street_name, house_number)
join estate_streets s on s.street_name = v.street_name
on conflict (street_id, house_number) do nothing;

-- Low confidence: confirm before adding
--   ('Primrose Crescent', '29'),  -- plot 207: number blurred; expected 30 by the even pattern
--   ('Primrose Crescent', '30'),  -- plot 206: number blurred
--   ('Mayflower Close', '2'),  -- plot 269: reads 2, but plot sits on the odd side
--   ('Maple Close', '4'),  -- plot ?: second block's numbers are crossed out on the map
--   ('Maple Close', '6'),  -- plot ?: 
--   ('Maple Close', '8'),  -- plot ?: 
--   ('Nettle Close', '13'),  -- plot ?: unnumbered plot between 186 and 183
--   ('Nettle Close', '15'),  -- plot 183: two plots (183, 182) both look like 15
--   ('Nettle Close', '17'),  -- plot 181: 
--   ('Nettle Close', '19'),  -- plot 180: 
--   ('Nettle Close', '21'),  -- plot 179: 
