import { Form, Head, Link } from '@inertiajs/react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { store } from '@/routes/login';
import { request } from '@/routes/password';

type Props = {
    status?: string;
    canResetPassword: boolean;
};

export default function Login({ status, canResetPassword }: Props) {
    return (
        <div className="flex h-screen w-screen overflow-hidden bg-white dark:bg-neutral-900">
            <Head title="Iniciar sesión" />

            {/* Panel izquierdo — formulario */}
            <div className="flex w-1/2 items-center justify-center overflow-y-auto border-r border-neutral-200 p-10 dark:border-neutral-800">
                <div className="flex w-full max-w-112.5 flex-col gap-10">

                    {/* Encabezado */}
                    <div className="flex flex-col gap-2">
                        <h1 className="text-display font-semibold text-neutral-900 dark:text-neutral-0">
                            Iniciar Sesión
                        </h1>
                        <p className="text-body-lg text-neutral-500 dark:text-neutral-400">
                            Ingrese su DNI y contraseña para entrar en el sistema
                        </p>
                    </div>

                    {/* Campos */}
                    <Form
                        {...store.form()}
                        resetOnSuccess={['password']}
                        className="flex flex-col gap-6"
                    >
                        {({ processing, errors }) => (
                            <>
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="dni">DNI</Label>
                                    <Input
                                        id="dni"
                                        type="text"
                                        name="dni"
                                        required
                                        autoFocus
                                        tabIndex={1}
                                        autoComplete="username"
                                        inputMode="numeric"
                                        maxLength={8}
                                        className="h-10"
                                    />
                                    <InputError message={errors.dni} />
                                </div>

                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="password">Contraseña</Label>
                                    <PasswordInput
                                        id="password"
                                        name="password"
                                        required
                                        tabIndex={2}
                                        autoComplete="current-password"
                                        className="h-10"
                                    />
                                    <InputError message={errors.password} />
                                </div>

                                <Button
                                    type="submit"
                                    className="h-10 w-full"
                                    tabIndex={3}
                                    disabled={processing}
                                >
                                    {processing && <Spinner />}
                                    Iniciar sesión
                                </Button>

                                {canResetPassword && (
                                    <div className="flex items-center justify-center">
                                        <Link
                                            href={request()}
                                            tabIndex={4}
                                            className="text-body-lg text-primary-500 transition-colors hover:text-primary-600 dark:text-white"
                                        >
                                            ¿Olvidaste tu contraseña?
                                        </Link>
                                    </div>
                                )}
                            </>
                        )}
                    </Form>

                    {status && (
                        <p className="text-center text-sm font-medium text-success-500">
                            {status}
                        </p>
                    )}
                </div>
            </div>

            {/* Panel derecho — imagen institucional */}
            <div className="relative w-1/2">
                <img
                    src="/images/gsc_edificio.png"
                    alt="Municipalidad de Puente Piedra - Edificio Municipal"
                    className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-black/70" />

                {/* Logos centrados */}
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                    <img
                        src="/images/escudo_pp.svg"
                        alt="Escudo de la Municipalidad de Puente Piedra"
                        className="h-50 w-39.25 object-contain"
                    />
                    <img
                        src="/images/siosec.svg"
                        alt="SIOSEC"
                        className="h-8.75 w-40.5 object-contain"
                    />
                    <img
                        src="/images/municipalidad_puente_piedra.svg"
                        alt="Municipalidad de Puente Piedra"
                        className="h-10.25 w-54.25 object-contain"
                    />
                </div>
            </div>
        </div>
    );
}
