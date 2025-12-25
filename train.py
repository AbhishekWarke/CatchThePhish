# train.py (UPDATED FOR 28 FEATURE MODEL)
import os, json
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, roc_auc_score, classification_report, confusion_matrix
import joblib

def main():
    print("Loading data/data_28.csv ...")
    df = pd.read_csv("data/data_28.csv")

    # Split into features + label
    # Drop non-numeric columns
    X = df.drop(["label", "url"], axis=1)

    y = df["label"]

    print("Using feature columns:", list(X.columns))

    # Train-test split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, stratify=y, test_size=0.20, random_state=42
    )

    # -----------------------------
    # 1) Random Forest (evaluation only)
    # -----------------------------
    print("\nTraining RandomForest for evaluation...")
    rf = RandomForestClassifier(
        n_estimators=120, max_depth=14, random_state=42, n_jobs=-1
    )
    rf.fit(X_train, y_train)
    rf_pred = rf.predict(X_test)
    rf_prob = rf.predict_proba(X_test)[:, 1]

    print("RF Accuracy:", accuracy_score(y_test, rf_pred))
    print("RF AUC:", roc_auc_score(y_test, rf_prob))
    print("RF Classification Report:")
    print(classification_report(y_test, rf_pred))
    print("RF Confusion Matrix:\n", confusion_matrix(y_test, rf_pred))

    os.makedirs("models", exist_ok=True)
    joblib.dump(rf, "models/rf_model.joblib")
    print("Saved RandomForest -> models/rf_model.joblib")

    # -----------------------------
    # 2) Logistic Regression (Browser Model)
    # -----------------------------
    print("\nTraining Logistic Regression (browser model)...")
    lr = LogisticRegression(max_iter=3000, random_state=42)
    lr.fit(X_train, y_train)

    lr_pred = lr.predict(X_test)
    lr_prob = lr.predict_proba(X_test)[:, 1]

    print("LR Accuracy:", accuracy_score(y_test, lr_pred))
    print("LR AUC:", roc_auc_score(y_test, lr_prob))
    print("LR Classification Report:")
    print(classification_report(y_test, lr_pred))

    # -----------------------------
    # 3) Export Model for Frontend
    # -----------------------------
    model_json = {
        "type": "logistic_regression",
        "feature_names": X.columns.tolist(),
        "coefficients": lr.coef_[0].tolist(),
        "intercept": float(lr.intercept_[0])
    }

    os.makedirs("site/public", exist_ok=True)
    with open("site/public/model_rules.json", "w", encoding="utf-8") as f:
        json.dump(model_json, f, indent=2)

    print("Saved LR model JSON -> site/public/model_rules.json")

if __name__ == "__main__":
    main()
