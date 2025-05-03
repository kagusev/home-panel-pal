
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { getBreakers, updateBreaker, Breaker } from '@/services/localStorageService';
import { toast } from "@/components/ui/use-toast";
import { ArrowLeft } from 'lucide-react';

const BreakerDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [breaker, setBreaker] = useState<Breaker | null>(null);
  const [name, setName] = useState('');
  const [amperage, setAmperage] = useState(0);
  const [isOn, setIsOn] = useState(true);
  
  useEffect(() => {
    if (!id) {
      navigate('/');
      return;
    }
    
    const breakerId = parseInt(id);
    const breakers = getBreakers();
    const foundBreaker = breakers.find(b => b.id === breakerId);
    
    if (!foundBreaker) {
      toast({
        variant: "destructive",
        title: "Breaker not found",
        description: "The specified breaker doesn't exist."
      });
      navigate('/');
      return;
    }
    
    setBreaker(foundBreaker);
    setName(foundBreaker.name);
    setAmperage(foundBreaker.amperage);
    setIsOn(foundBreaker.isOn);
  }, [id, navigate]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!breaker) return;
    
    const updatedBreaker: Breaker = {
      ...breaker,
      name,
      amperage,
      isOn
    };
    
    updateBreaker(updatedBreaker);
    
    toast({
      title: "Breaker Updated",
      description: "Your changes have been saved."
    });
    
    navigate('/');
  };
  
  const handleCancel = () => {
    navigate('/');
  };
  
  if (!breaker) {
    return <div className="p-4 text-center">Loading...</div>;
  }
  
  return (
    <div className="container max-w-md mx-auto p-4">
      <Button 
        variant="ghost" 
        className="mb-4 flex items-center" 
        onClick={handleCancel}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Panel
      </Button>
      
      <Card>
        <CardHeader>
          <CardTitle>Breaker {breaker.position} Details</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="breaker-name">Breaker Name</Label>
              <Input
                id="breaker-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Kitchen Lights"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="breaker-amperage">Amperage</Label>
              <Input
                id="breaker-amperage"
                type="number"
                value={amperage}
                onChange={(e) => setAmperage(parseInt(e.target.value) || 0)}
                min="0"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="breaker-state"
                checked={isOn}
                onChange={(e) => setIsOn(e.target.checked)}
                className="h-4 w-4"
              />
              <Label htmlFor="breaker-state">Breaker is {isOn ? 'On' : 'Off'}</Label>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default BreakerDetail;
