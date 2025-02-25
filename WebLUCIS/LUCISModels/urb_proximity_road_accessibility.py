import pandas as pd
import geopandas as gpd
from django.db import connections
from sqlalchemy import create_engine
from sqlalchemy.sql import text
from pylusat import distance, rescale

db_url = "postgresql://postgres:151010@db:5432/template_postgis"

# def save_to_output_db(gdf, column_name):
#     """
#     Save a GeoDataFrame result to the output database.
#     Dynamically handles table creation and updates based on region or district.
#     """
#     engine = create_engine("postgresql://postgres:output151010@output_db:5432/output_db")
   
#     # Determine table name based on the uniqueness of 'gid_mmda'
#     if len(gdf['gid_mmda'].unique()) == 1:
#         table_name = f"{gdf['district_c'].iloc[0].lower()}_output"
#     else:
#         table_name = f"{gdf['region'].iloc[0].lower()}_output"
 
#     # Step 1: Check if the table exists
#     with engine.connect() as conn:
#         result = conn.execute(text(f"""
#             SELECT EXISTS (
#                 SELECT FROM information_schema.tables
#                 WHERE table_name = :table_name
#             );
#         """), {"table_name": table_name}).fetchone()
#         table_exists = result[0]
 
#     # Step 2: Create table if it does not exist and save the entire GeoDataFrame
#     if not table_exists:
#         # Include result column in required columns
#         required_columns = ['gid_left', 'gid_mmda', 'region', 'district', 'district_c', 'geom', column_name]
#         filtered_gdf = gdf[required_columns]
 
#         # Save the entire GeoDataFrame (necessary columns + result column)
#         filtered_gdf.to_postgis(table_name, engine, if_exists="replace", index=False)
#         return
 
#     # Step 3 & 4: Add or overwrite the result column
#     with engine.connect() as conn:
#         existing_columns = conn.execute(text(f"""
#             SELECT column_name
#             FROM information_schema.columns
#             WHERE table_name = :table_name;
#         """), {"table_name": table_name}).fetchall()
#         existing_columns = [col[0] for col in existing_columns]
 
#     # If the result column exists, overwrite its values
#     if column_name in existing_columns:
#         filtered_gdf = gdf[['gid_left', column_name]]  # Include only primary key and result column
#         with engine.begin() as conn:
#             for _, row in filtered_gdf.iterrows():
#                 if not pd.isna(row[column_name]):  # Only update valid rows
#                     conn.execute(text(f"""
#                         UPDATE "{table_name}"
#                         SET "{column_name}" = :value
#                         WHERE gid_left = :gid;
#                     """), {"value": float(row[column_name]), "gid": int(row["gid_left"])})
 
#     # If the result column does not exist, add it and save values
#     else:
#         with engine.begin() as conn:
#             conn.execute(text(f"""
#                 ALTER TABLE "{table_name}" ADD COLUMN "{column_name}" DOUBLE PRECISION;
#             """))
#         filtered_gdf = gdf[['gid_left', column_name]]  # Include only primary key and result column
#         with engine.begin() as conn:
#             for _, row in filtered_gdf.iterrows():
#                 if not pd.isna(row[column_name]):  # Only update valid rows
#                     conn.execute(text(f"""
#                         UPDATE "{table_name}"
#                         SET "{column_name}" = :value
#                         WHERE gid_left = :gid;
#                     """), {"value": float(row[column_name]), "gid": int(row['gid_left'])})

def save_to_output_db(gdf, column_name):
    """
    Save a GeoDataFrame result to the output database.
    Dynamically handles table creation and updates based on region or district.
    """
    # Determine table name based on the uniqueness of 'gid_mmda'
    if len(gdf['gid_mmda'].unique()) == 1:
        table_name = f"{gdf['district_c'].iloc[0].lower()}_output"
    else:
        table_name = f"{gdf['region'].iloc[0].lower()}_output"
 
    output_db_engine = create_engine("postgresql://postgres:output151010@output_db:5432/output_db")
 
    # Step 1: Check if the table exists
    with connections['output_db'].cursor() as cursor:
        cursor.execute("""
            SELECT EXISTS (
                SELECT FROM information_schema.tables
                WHERE table_name = %s
            );
        """, [table_name])
        table_exists = cursor.fetchone()[0]
 
    # Step 2: Create table if it does not exist and save the entire GeoDataFrame
    if not table_exists:
        # Include result column in required columns
        required_columns = ['gid_left', 'gid_mmda', 'region', 'district', 'district_c', 'geom', column_name]
        filtered_gdf = gdf[required_columns]
 
        # Save the entire GeoDataFrame (necessary columns + result column)
        filtered_gdf.to_postgis(table_name, output_db_engine, if_exists="replace", index=False)
        return
 
    # Step 3 & 4: Add or overwrite the result column
    with connections['output_db'].cursor() as cursor:
        cursor.execute("""
            SELECT column_name
            FROM information_schema.columns
            WHERE table_name = %s;
        """, [table_name])
        existing_columns = [row[0] for row in cursor.fetchall()]
 
    # If the result column exists, overwrite its values
    if column_name in existing_columns:
        filtered_gdf = gdf[['gid_left', column_name]]  # Include only primary key and result column
        with connections['output_db'].cursor() as cursor:
            for _, row in filtered_gdf.iterrows():
                if not pd.isna(row[column_name]):  # Only update valid rows
                    cursor.execute(f"""
                        UPDATE "{table_name}"
                        SET "{column_name}" = %s
                        WHERE gid_left = %s;
                    """, [float(row[column_name]), int(row["gid_left"])])
 
    # If the result column does not exist, add it and save values
    else:
        with connections['output_db'].cursor() as cursor:
            cursor.execute(f"""
                ALTER TABLE "{table_name}" ADD COLUMN "{column_name}" DOUBLE PRECISION;
            """)
        filtered_gdf = gdf[['gid_left', column_name]]  # Include only primary key and result column
        with connections['output_db'].cursor() as cursor:
            for _, row in filtered_gdf.iterrows():
                if not pd.isna(row[column_name]):  # Only update valid rows
                    cursor.execute(f"""
                        UPDATE "{table_name}"
                        SET "{column_name}" = %s
                        WHERE gid_left = %s;
                    """, [float(row[column_name]), int(row['gid_left'])])
 

def distance_to_road(input_gdf, road_class, cell_size, method, rescale_min, rescale_max):
    db_connect = create_engine(db_url)
    if road_class == 'primary_secondary':
        road_sql = 'SELECT * FROM ghanaroads'
    else:
        road_sql = f"SELECT * FROM ghanaroads WHERE fclass = '{road_class}'"  # Drop down list
    road_gdf = gpd.read_postgis(sql=road_sql, con=db_connect)

    try:
        distance_output = distance.to_line(
            input_gdf=input_gdf,  # Selected ghana district or other sub-model result gdf
            line_gdf=road_gdf,
            cellsize=int(cell_size),  # Enter by user - Float number box (default 30)
            method=method  # Select by user (optional) - Drop down list
        )
        input_gdf['distance_road'] = distance_output
        rescale_output = rescale.linear(
            input_df=input_gdf,
            input_col='distance_road',
            output_col='distance_road_rescale',
            start=distance_output.max(),
            end=distance_output.min(),
            output_min=int(rescale_min),  # Enter by user (optional) - Float number box
            output_max=int(rescale_max)  # Enter by user (optional) - Float number box
        )
        rescale_output['distance_road_rescale'] = rescale_output['distance_road_rescale'].fillna(int(rescale_min))
        rescale_output_reproject = rescale_output.to_crs(epsg=4326)
        return rescale_output_reproject

    except Exception as e:
        print(e)
        return None