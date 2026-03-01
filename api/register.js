export default {
  async fetch(request) {
    return Response.json({ ok: true, message: 'API is running' }, { status: 200 })
  },
}
