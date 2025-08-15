# TODO: Copy in backend code

# Path to the Vite/React build directory so the server can serve the frontend
app = Flask(
    __name__, static_folder="../client/dist/assets", template_folder="../client/dist"
)
