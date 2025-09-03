import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Search, RefreshCw, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const Admin = () => {
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const fetchRegistrations = async () => {
    setLoading(true);
    try {
      // Fetch registrations from project's Supabase
      const { data, error } = await (supabase as any)
        .from('registrations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setRegistrations(data || []);
      toast({
        title: "Success",
        description: `Loaded ${data?.length || 0} registrations`,
      });
    } catch (error) {
      console.error('Fetch error:', error);
      toast({
        title: "Error",
        description: "Failed to fetch registrations",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // SEO: set page title and description
    document.title = 'Admin - Registrations';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', 'Admin panel to manage registrations, category details and status.');

    fetchRegistrations();
  }, []);

  const filteredRegistrations = registrations.filter(reg =>
    reg.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reg.mobile_number?.includes(searchTerm) ||
    reg.address?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Admin Panel</h1>
          <p className="text-muted-foreground">Manage registrations for the self-employment program</p>
        </div>

        {/* Stats Card */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Registration Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{registrations.length}</div>
                <div className="text-sm text-muted-foreground">Total Registrations</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-secondary">{filteredRegistrations.length}</div>
                <div className="text-sm text-muted-foreground">Filtered Results</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-accent">100%</div>
                <div className="text-sm text-muted-foreground">Data Accuracy</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Controls */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, mobile, or address..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button onClick={fetchRegistrations} disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Registrations Table */}
        <Card>
          <CardHeader>
            <CardTitle>Registrations ({filteredRegistrations.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Mobile</TableHead>
                    <TableHead>Customer ID</TableHead>
                    <TableHead>Ward</TableHead>
                    <TableHead>Category Details</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Registration Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <div className="flex items-center justify-center">
                          <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                          Loading registrations...
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredRegistrations.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No registrations found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRegistrations.map((registration, index) => (
                      <TableRow key={registration.id || index}>
                        <TableCell className="font-medium">
                          {registration.full_name || 'N/A'}
                        </TableCell>
                        <TableCell>{registration.mobile_number || 'N/A'}</TableCell>
                        <TableCell>{registration.customer_id || 'N/A'}</TableCell>
                        <TableCell>{registration.ward || 'N/A'}</TableCell>
                        <TableCell>{registration.category_details || registration.category || registration.category_name || 'N/A'}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            registration.status === 'pending' 
                              ? 'bg-yellow-100 text-yellow-800' 
                              : 'bg-green-100 text-green-800'}`
                          }>
                            {registration.status || 'N/A'}
                          </span>
                        </TableCell>
                        <TableCell>
                          {registration.created_at 
                            ? new Date(registration.created_at).toLocaleDateString()
                            : 'N/A'
                          }
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Admin;
