import React, { useCallback, useEffect, useState } from 'react'
import { Button } from './ui/button'
import { PlaidLinkOnSuccess, PlaidLinkOptions, usePlaidLink } from 'react-plaid-link'
import { useRouter } from 'next/navigation';
import { createLinkToken, exchangePublicToken } from '@/lib/actions/user.actions';
import Image from 'next/image';

const PlaidLink = ({ user, variant }: PlaidLinkProps) => {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null); // Ensure token starts as null to handle loading state
  const [isLoading, setIsLoading] = useState(true); // Track the loading state

  useEffect(() => {
    const getLinkToken = async () => {
      try {
        const data = await createLinkToken(user);
        if (data?.linkToken) {
          setToken(data.linkToken);
        }
      } catch (error) {
        console.error('Error generating link token:', error);
      } finally {
        setIsLoading(false); // Stop loading regardless of the outcome
      }
    };

    getLinkToken();
  }, [user]);

  const onSuccess = useCallback<PlaidLinkOnSuccess>(async (public_token: string) => {
    try {
      await exchangePublicToken({
        publicToken: public_token,
        user,
      });
      router.push('/');
    } catch (error) {
      console.error('Error exchanging public token:', error);
    }
  }, [user, router]);

  const config: PlaidLinkOptions = {
    token: token || '', // Ensure token is passed properly
    onSuccess,
  };

  const { open, ready } = usePlaidLink(config);

  return (
    <>
      {variant === 'primary' ? (
        <Button
          onClick={() => open()}
          disabled={!ready || isLoading} // Disable if not ready or loading
          className="plaidlink-primary"
        >
          Connect bank
        </Button>
      ) : variant === 'ghost' ? (
        <Button onClick={() => open()} variant="ghost" className="plaidlink-ghost" disabled={isLoading}>
          <Image src="/icons/connect-bank.svg" alt="connect bank" width={24} height={24} />
          <p className="hidden text-[16px] font-semibold text-black-2 xl:block">Connect bank</p>
        </Button>
      ) : (
        <Button onClick={() => open()} className="plaidlink-default" disabled={isLoading}>
          <Image src="/icons/connect-bank.svg" alt="connect bank" width={24} height={24} />
          <p className="text-[16px] font-semibold text-black-2">Connect bank</p>
        </Button>
      )}
    </>
  );
};

export default PlaidLink;
