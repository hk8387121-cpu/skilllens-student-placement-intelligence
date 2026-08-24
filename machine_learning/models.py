import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix
from sklearn.cluster import KMeans
from mlxtend.frequent_patterns import apriori, association_rules
from sklearn.preprocessing import LabelEncoder, StandardScaler

class SkillLensML:
    def __init__(self, data_path='../dataset/student_placement.csv'):
        self.df = pd.read_csv(data_path)
        self.preprocess_data()

    def preprocess_data(self):
        # Handle Missing Values
        self.df.fillna(self.df.mean(numeric_only=True), inplace=True)
        
        # Encoding categorical
        le = LabelEncoder()
        if 'gender' in self.df.columns:
            self.df['gender'] = le.fit_transform(self.df['gender'])
        if 'extracurricular_activities' in self.df.columns:
            self.df['extracurricular_activities'] = le.fit_transform(self.df['extracurricular_activities'])

    def decision_tree_classification(self):
        print("\n--- Decision Tree Classification ---")
        features = ['ssc_percentage', 'hsc_percentage', 'degree_percentage', 'cgpa', 
                    'technical_skill_score', 'soft_skill_score', 'internship_count', 
                    'certifications', 'attendance_percentage', 'backlogs']
        
        X = self.df[features]
        y = self.df['placement_status']

        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

        scaler = StandardScaler()
        X_train = scaler.fit_transform(X_train)
        X_test = scaler.transform(X_test)

        clf = DecisionTreeClassifier(random_state=42)
        clf.fit(X_train, y_train)

        y_pred = clf.predict(X_test)

        print(f"Accuracy: {accuracy_score(y_test, y_pred):.4f}")
        print(f"Precision: {precision_score(y_test, y_pred):.4f}")
        print(f"Recall: {recall_score(y_test, y_pred):.4f}")
        print(f"F1 Score: {f1_score(y_test, y_pred):.4f}")
        print(f"Confusion Matrix:\n{confusion_matrix(y_test, y_pred)}")

        return clf, scaler

    def kmeans_clustering(self):
        print("\n--- K-Means Clustering ---")
        features = ['cgpa', 'technical_skill_score', 'soft_skill_score']
        X = self.df[features]

        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X)

        kmeans = KMeans(n_clusters=3, random_state=42, n_init=10)
        self.df['Cluster'] = kmeans.fit_predict(X_scaled)

        # Map clusters to potential based on cluster centers
        centers = kmeans.cluster_centers_
        # Simple heuristic: sum of normalized centers
        cluster_scores = centers.sum(axis=1)
        sorted_indices = cluster_scores.argsort()[::-1] # descending

        mapping = {
            sorted_indices[0]: 'High Placement Potential',
            sorted_indices[1]: 'Medium Placement Potential',
            sorted_indices[2]: 'Low Placement Potential'
        }

        self.df['Placement_Potential'] = self.df['Cluster'].map(mapping)
        print(self.df['Placement_Potential'].value_counts())

    def apriori_association(self):
        print("\n--- Apriori Association Rule Mining ---")
        # Create transaction-like dataset
        basket = pd.DataFrame()
        basket['High_CGPA'] = (self.df['cgpa'] >= 8.0).astype(bool)
        basket['Has_Internship'] = (self.df['internship_count'] > 0).astype(bool)
        basket['Has_Certifications'] = (self.df['certifications'] > 0).astype(bool)
        basket['High_Tech'] = (self.df['technical_skill_score'] >= 80).astype(bool)
        basket['Placed'] = (self.df['placement_status'] == 1).astype(bool)

        frequent_itemsets = apriori(basket, min_support=0.1, use_colnames=True)
        if not frequent_itemsets.empty:
            rules = association_rules(frequent_itemsets, metric="confidence", min_threshold=0.5)
            # Filter rules targeting Placement
            placed_rules = rules[rules['consequents'] == {'Placed'}]
            print(placed_rules[['antecedents', 'support', 'confidence', 'lift']].head(10))
        else:
            print("No frequent itemsets found.")

if __name__ == "__main__":
    # ml = SkillLensML()
    # ml.decision_tree_classification()
    # ml.kmeans_clustering()
    # ml.apriori_association()
    pass
