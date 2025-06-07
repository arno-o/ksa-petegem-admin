export type Leiding = {
  id: number;
  voornaam: string;
  familienaam: string;
  werk: string | null;
  studies: string | null;
  ksa_betekenis: string | null;
  ksa_ervaring: string | null;
  leiding_sinds: string | null;
  geboortedatum: string | null;
  hoofdleiding: boolean;
  werkgroepen: any;
  foto_url: string | null;
};