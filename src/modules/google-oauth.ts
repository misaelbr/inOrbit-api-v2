import { google } from 'googleapis'
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

function getOauth2Client() {
  return new google.auth.OAuth2(
    env.GOOGLE_CLIENT_ID,
    env.GOOGLE_CLIENT_SECRET_KEY,
    env.GOOGLE_REDIRECT_URI
  )
}

export async function getAccessTokenFromCode(code: string) {
  const oauth2Client = getOauth2Client()

  const { tokens } = await oauth2Client.getToken(code)

  const { access_token } = tokens

  return access_token
}

export async function getUserFromAccessToken(
  accessToken: string
): Promise<GoogleUserResponse> {
  const userUrl = new URL('https://www.googleapis.com/oauth2/v1/userinfo')
  userUrl.searchParams.set('access_token', accessToken)
  userUrl.searchParams.set('alt', 'json')

  const response = await fetch(userUrl)

  const res = await response.json()
  const data: GoogleUserResponse = res

  return data
}
