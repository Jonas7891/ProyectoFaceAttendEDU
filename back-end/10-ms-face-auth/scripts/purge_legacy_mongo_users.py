import os

from pymongo import MongoClient


def main() -> None:
    client = MongoClient(os.getenv("MONGO_URL", "mongodb://biometric:biometric@mongo:27017/?authSource=admin"))
    database = client[os.getenv("MONGO_DB", "biometric")]
    if "users" in database.list_collection_names():
        database.users.drop()
        print("Coleccion Mongo legacy 'users' eliminada.")
    else:
        print("No existe la coleccion Mongo legacy 'users'.")
    client.close()


if __name__ == "__main__":
    main()