import { env } from '../env'

interface GoogleTokensResponse {
  access_token: string
  expires_in: number
  refrech_token: string
  scope: string
  id_token: string
}

interface GoogleUserResponse {
  id: string
  email: string
  name: string
  picture: string
}

export async function getAccessTokenFromCode(code: string) {
  const accessTokenUrl = new URL('https://oauth2.googleapis.com/token')

  accessTokenUrl.searchParams.set('code', code)
  accessTokenUrl.searchParams.set('client_id', env.GOOGLE_CLIENT_ID)
  accessTokenUrl.searchParams.set('client_secret', env.GOOGLE_CLIENT_SECRET_KEY)
  accessTokenUrl.searchParams.set('redirect_uri', env.GOOGLE_REDIRECT_URI)
  accessTokenUrl.searchParams.set('grant_type', 'authorization_code')

  const response = await fetch(accessTokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  })

  const { access_token }: GoogleTokensResponse = await response.json()

  return access_token
}

export async function getUserFromAccessToken(
  accessToken: string
): Promise<GoogleUserResponse> {
  const userUrl = new URL('https://www.googleapis.com/oauth2/v1/userinfo')
  userUrl.searchParams.set('access_token', accessToken)
  userUrl.searchParams.set('alt', 'json')

  const response = await fetch(userUrl)

  const data: GoogleUserResponse = await response.json()

  return data
}
