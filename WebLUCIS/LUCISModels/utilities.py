import pandas as pd
import geopandas as gpd
from django.db import connections
from sqlalchemy import create_engine


def select_study_area(region, district_id):
    """
    Select the study area and return its 1km MGRS coverage.
    """
    db_connect = create_engine("postgresql://postgres:151010@db:5432/template_postgis")
    region_sql = f"SELECT * FROM ghanammda WHERE region = '{region}'"
    region_gdf = gpd.read_postgis(sql=region_sql, con=db_connect)
    mgrs_sql = 'SELECT * FROM ghanamgrs'
    mgrs_gdf = gpd.read_postgis(sql=mgrs_sql, con=db_connect)
    region_mgrs_gdf = gpd.sjoin(mgrs_gdf, region_gdf, how='inner', predicate='intersects', rsuffix='mmda')
    region_mgrs_gdf = region_mgrs_gdf.drop_duplicates(subset='geom')
    
    if int(district_id) == 0:
        district_mgrs_gdf = region_mgrs_gdf
    else:
        district_mgrs_gdf = region_mgrs_gdf.loc[region_mgrs_gdf['gid_mmda'] == int(district_id), :]
    return district_mgrs_gdf


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