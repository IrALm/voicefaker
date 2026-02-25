from fastapi import FastAPI, HTTPException, Query
from fastapi.responses import FileResponse
from gtts import gTTS
from pydub import AudioSegment
import uuid
import os

app = FastAPI(title="TTS FastAPI")

# Configuration
AVAILABLE_VOICES = ["dark_vador", "robot", "cartoon" , "masculine_rock", "child"]
AVAILABLE_LANGS = ["fr", "en", "es", "de", "it"]
AUDIO_FOLDER = "generated_audio"
os.makedirs(AUDIO_FOLDER, exist_ok=True)

def apply_voice_effect(audio_path: str, voice: str) -> None:
    """Modifie le fichier audio selon la voix choisie"""
    sound = AudioSegment.from_file(audio_path, format="mp3")
    
    if voice == "dark_vador":
        # Baisser le pitch et ralentir
        sound = sound._spawn(sound.raw_data, overrides={"frame_rate": int(sound.frame_rate * 0.8)})
        sound = sound.set_frame_rate(44100)
        
    elif voice == "robot":
        # Augmenter légèrement le pitch et ajouter un effet "robotique"
        sound = sound._spawn(sound.raw_data, overrides={"frame_rate": int(sound.frame_rate * 1.2)})
        sound = sound.set_frame_rate(44100)
        # légère distorsion/echo
        sound = sound.overlay(sound - 6)
        
    elif voice == "cartoon":
        # Accélérer et augmenter le pitch
        sound = sound._spawn(sound.raw_data, overrides={"frame_rate": int(sound.frame_rate * 1.5)})
        sound = sound.set_frame_rate(44100)

    elif voice == "masculine_rock":
        # Baisser légèrement le pitch et augmenter le volume
        sound = sound._spawn(sound.raw_data, overrides={"frame_rate": int(sound.frame_rate * 0.45)})
        sound = sound.set_frame_rate(44100)
        sound += 3  # augmenter le volume

    elif voice == "child":
        # Accélérer et augmenter le pitch pour effet enfant
        sound = sound._spawn(sound.raw_data, overrides={"frame_rate": int(sound.frame_rate * 2.9)})
        sound = sound.set_frame_rate(44100)
        sound -= 2  # baisser légèrement le volume pour effet plus léger
    
    else:
        # Voix par défaut, pas d’effet
        pass

    # Exporter le fichier modifié
    sound.export(audio_path, format="mp3")

@app.post("/generate-audio/")
def generate_audio(
    text: str = Query(..., description="Texte à convertir en audio"),
    lang: str = Query(..., description="Langue du texte"),
    voice: str = Query(..., description="Voix à utiliser")
):
    # Vérifications
    if lang not in AVAILABLE_LANGS:
        raise HTTPException(status_code=400, detail=f"Langue non supportée. Choisir parmi {AVAILABLE_LANGS}")
    if voice not in AVAILABLE_VOICES:
        raise HTTPException(status_code=400, detail=f"Voix non supportée. Choisir parmi {AVAILABLE_VOICES}")

    # Génération du fichier audio
    filename = f"{uuid.uuid4()}.mp3"
    filepath = os.path.join(AUDIO_FOLDER, filename)
    tts = gTTS(text=text, lang=lang)
    tts.save(filepath)

    # Appliquer l'effet de voix
    apply_voice_effect(filepath, voice)

    return {"message": "Audio généré avec succès", "filename": filename}

@app.get("/download-audio/{filename}")
def download_audio(filename: str):
    filepath = os.path.join(AUDIO_FOLDER, filename)
    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="Fichier audio non trouvé")
    return FileResponse(filepath, media_type="audio/mpeg", filename=filename)