import { type LoaderFunctionArgs, redirect } from '@remix-run/node'

export async function loader(_props: LoaderFunctionArgs) {
	return redirect('/files')
}
