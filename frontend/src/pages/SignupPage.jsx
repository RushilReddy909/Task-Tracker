import { Link, useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';

import { signupSchema } from '@/schemas/authSchemas';
import { useSignup } from '@/hooks/useAuth';
import AuthLayout from '@/components/layout/AuthLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Field, FieldGroup, FieldLabel, FieldError, FieldDescription } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function SignupPage() {
  const navigate = useNavigate();
  const signup = useSignup();

  const { control, handleSubmit } = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: { email: '', password: '', confirmPassword: '' },
  });

  const onSubmit = ({ email, password }) => {
    // Backend only expects { email, password } — confirmPassword is a
    // frontend-only validation field and is intentionally not sent.
    signup.mutate(
      { email, password },
      { onSuccess: () => navigate('/', { replace: true }) }
    );
  };

  return (
    <AuthLayout
      title="Create your account"
      description="Start tracking your tasks in seconds"
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-primary hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <Card>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <FieldGroup>
              <Controller
                name="email"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="email">Email</FieldLabel>
                    <Input
                      {...field}
                      id="email"
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              <Controller
                name="password"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="password">Password</FieldLabel>
                    <Input
                      {...field}
                      id="password"
                      type="password"
                      autoComplete="new-password"
                      placeholder="••••••••"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid ? (
                      <FieldError errors={[fieldState.error]} />
                    ) : (
                      <FieldDescription>At least 6 characters</FieldDescription>
                    )}
                  </Field>
                )}
              />

              <Controller
                name="confirmPassword"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="confirmPassword">Confirm password</FieldLabel>
                    <Input
                      {...field}
                      id="confirmPassword"
                      type="password"
                      autoComplete="new-password"
                      placeholder="••••••••"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              <Button type="submit" className="w-full" disabled={signup.isPending}>
                {signup.isPending && <Loader2 className="animate-spin" />}
                {signup.isPending ? 'Creating account...' : 'Create account'}
              </Button>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </AuthLayout>
  );
}
